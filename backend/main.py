from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
from pymongo import MongoClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import jwt, JWTError
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google import genai
from bson import ObjectId
import os, secrets, hashlib, hmac
import certifi

load_dotenv()

app = FastAPI(title="CampusFlow API", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
JWT_SECRET = os.getenv("JWT_SECRET", "").strip()

if not MONGO_URI:
    print("WARNING: MONGO_URI is not configured. MongoDB features will return a configuration error.")
if not JWT_SECRET:
    print("WARNING: JWT_SECRET is not configured. Authentication will not work until it is set.")

# MongoDB Atlas is the ONLY application database.
# connect=False prevents a temporary Atlas/TLS/network issue from killing Uvicorn startup.
mongo_client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=8000,
    connectTimeoutMS=8000,
    socketTimeoutMS=15000,
    retryWrites=True,
) if MONGO_URI else None
mongo_db = mongo_client["campusflow"] if mongo_client else None
_indexes_ready = False

GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
GOOGLE_CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "credentials.json")
gemini = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def now_iso():
    return datetime.utcnow().isoformat()


def new_id():
    return secrets.token_hex(12)


def require_mongo():
    global _indexes_ready
    if mongo_client is None or mongo_db is None:
        raise HTTPException(503, "MongoDB Atlas is not configured. Check MONGO_URI in backend/.env")
    try:
        mongo_client.admin.command("ping")
        if not _indexes_ready:
            mongo_db.users.create_index("usn", unique=True)
            mongo_db.users.create_index("email", unique=True)
            mongo_db.tasks.create_index([("user_id", 1), ("created_at", -1)])
            mongo_db.messages.create_index([("user_id", 1), ("received_at", -1)])
            mongo_db.gmail_connections.create_index("email", unique=True)
            _indexes_ready = True
        return mongo_db
    except Exception as exc:
        raise HTTPException(503, "MongoDB Atlas is unavailable. Check the Atlas connection, network access and MONGO_URI.") from exc


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return "scrypt$" + salt.hex() + "$" + digest.hex()


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, salt_hex, digest_hex = stored.split("$", 2)
        if scheme != "scrypt":
            return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def mongo_user_doc(doc):
    if not doc:
        return None
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "usn": doc.get("usn", ""),
        "email": doc.get("email", ""),
        "password_hash": doc.get("password_hash", ""),
        "created_at": doc.get("created_at", ""),
    }


def find_user_by_id(user_id):
    db = require_mongo()
    try:
        return mongo_user_doc(db.users.find_one({"_id": ObjectId(user_id)}))
    except Exception:
        return None


def find_user(login: str):
    db = require_mongo()
    return mongo_user_doc(db.users.find_one({"$or": [{"usn": login.upper()}, {"email": login.lower()}]}))


def token_for(user):
    return jwt.encode(
        {"sub": str(user["id"]), "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET,
        algorithm="HS256",
    )


def current_user(authorization: str = Header(default="")):
    if not JWT_SECRET:
        raise HTTPException(503, "JWT_SECRET is not configured")
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Login required")
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=["HS256"])
        user = find_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except HTTPException:
        raise
    except (JWTError, Exception) as exc:
        raise HTTPException(401, "Invalid or expired login") from exc


class RegisterRequest(BaseModel):
    name: str
    usn: str
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    login: str
    password: str


class Task(BaseModel):
    title: str
    subject: str = ""
    due_date: str = ""
    priority: str = "Medium"
    completed: bool = False


class IncomingMessage(BaseModel):
    source: str
    sender: str = ""
    message: str


class AnalyzeRequest(BaseModel):
    message: str


@app.get("/")
def home():
    return {"message": "CampusFlow backend is running!", "database": "MongoDB Atlas"}


@app.get("/api/health")
def health():
    if mongo_client is None:
        return {"status": "online", "project": "CampusFlow", "database": "MongoDB Atlas not configured"}
    try:
        mongo_client.admin.command("ping")
        return {"status": "online", "project": "CampusFlow", "database": "MongoDB Atlas connected", "database_mode": "mongo"}
    except Exception:
        return {"status": "online", "project": "CampusFlow", "database": "MongoDB Atlas unavailable", "database_mode": "mongo"}


@app.post("/api/auth/register")
def register(d: RegisterRequest):
    if not JWT_SECRET:
        raise HTTPException(503, "JWT_SECRET is not configured")
    name, usn, email = d.name.strip(), d.usn.strip().upper(), str(d.email).strip().lower()
    if not name or not usn:
        raise HTTPException(400, "Name and USN are required")
    if len(d.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if d.password != d.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    db = require_mongo()
    try:
        if db.users.find_one({"$or": [{"usn": usn}, {"email": email}]}):
            raise HTTPException(409, "USN or email is already registered")
        result = db.users.insert_one({"name": name, "usn": usn, "email": email, "password_hash": hash_password(d.password), "created_at": now_iso()})
        return {"success": True, "message": "Account created successfully", "user_id": str(result.inserted_id), "database": "MongoDB Atlas"}
    except HTTPException:
        raise
    except Exception as exc:
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            raise HTTPException(409, "USN or email is already registered")
        raise HTTPException(503, "MongoDB Atlas could not save the account") from exc


@app.post("/api/auth/login")
def login(d: LoginRequest):
    user = find_user(d.login.strip())
    if not user or not verify_password(d.password, user["password_hash"]):
        raise HTTPException(401, "Invalid USN/email or password")
    return {"success": True, "token": token_for(user), "user": {"name": user["name"], "usn": user["usn"], "email": user["email"], "student_id": user["id"]}}


@app.get("/api/auth/me")
def me(user=Depends(current_user)):
    return {"name": user["name"], "usn": user["usn"], "email": user["email"], "student_id": user["id"]}


@app.post("/api/tasks")
def create_task(t: Task, user=Depends(current_user)):
    db = require_mongo()
    result = db.tasks.insert_one({**t.model_dump(), "user_id": user["id"], "created_at": now_iso()})
    return {"success": True, "task_id": str(result.inserted_id)}


@app.get("/api/tasks")
def get_tasks(user=Depends(current_user)):
    db = require_mongo()
    rows = db.tasks.find({"user_id": user["id"]}).sort("created_at", -1)
    return [{"id": str(x["_id"]), "title": x.get("title", ""), "subject": x.get("subject", ""), "due_date": x.get("due_date", ""), "priority": x.get("priority", "Medium"), "completed": bool(x.get("completed", False))} for x in rows]


@app.patch("/api/tasks/{task_id}")
def update_task(task_id: str, completed: bool, user=Depends(current_user)):
    db = require_mongo()
    try:
        result = db.tasks.update_one({"_id": ObjectId(task_id), "user_id": user["id"]}, {"$set": {"completed": completed}})
    except Exception as exc:
        raise HTTPException(404, "Task not found") from exc
    if not result.matched_count:
        raise HTTPException(404, "Task not found")
    return {"success": True}


@app.post("/api/messages")
def receive_message(d: IncomingMessage, user=Depends(current_user)):
    db = require_mongo()
    result = db.messages.insert_one({"user_id": user["id"], "source": d.source, "sender": d.sender, "message": d.message, "received_at": now_iso()})
    return {"success": True, "message_id": str(result.inserted_id)}


@app.post("/api/ai/analyze")
def analyze(d: AnalyzeRequest, user=Depends(current_user)):
    if not gemini:
        raise HTTPException(503, "Gemini API key is not configured")
    prompt = """You are CampusFlow AI Information Hub. Analyze the message. Return ONLY valid JSON with is_academic, type (task/event/information), title, subject, due_date, priority (Low/Medium/High), reason. Do not invent information.\n\nMessage:\n""" + d.message
    try:
        result = gemini.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        return {"success": True, "analysis": result.text}
    except Exception as exc:
        raise HTTPException(502, "Gemini analysis failed. Check the Gemini API configuration and quota.") from exc


@app.get("/auth/google")
def google_login():
    if not os.path.exists(GOOGLE_CREDENTIALS_FILE):
        raise HTTPException(503, "Google credentials.json is missing from the backend folder")
    flow = Flow.from_client_secrets_file(GOOGLE_CREDENTIALS_FILE, scopes=GMAIL_SCOPES, autogenerate_code_verifier=False)
    flow.redirect_uri = "http://127.0.0.1:8000/auth/google/callback"
    url, _ = flow.authorization_url(access_type="offline", include_granted_scopes="true", prompt="consent")
    return RedirectResponse(url)


@app.get("/auth/google/callback")
def google_callback(code: str):
    if not os.path.exists(GOOGLE_CREDENTIALS_FILE):
        raise HTTPException(503, "Google credentials.json is missing from the backend folder")
    flow = Flow.from_client_secrets_file(GOOGLE_CREDENTIALS_FILE, scopes=GMAIL_SCOPES, autogenerate_code_verifier=False)
    flow.redirect_uri = "http://127.0.0.1:8000/auth/google/callback"
    flow.fetch_token(code=code)
    credentials = flow.credentials
    service = build("gmail", "v1", credentials=credentials)
    email = service.users().getProfile(userId="me").execute()["emailAddress"]
    db = require_mongo()
    db.gmail_connections.update_one({"email": email}, {"$set": {"email": email, "token": credentials.token, "refresh_token": credentials.refresh_token, "scopes": GMAIL_SCOPES}}, upsert=True)
    return HTMLResponse(f"<h1>Gmail Connected!</h1><p>{email}</p><p>You can close this window.</p>")


def get_gmail_connection(email):
    return require_mongo().gmail_connections.find_one({"email": email})


def save_gmail_token(email, token):
    require_mongo().gmail_connections.update_one({"email": email}, {"$set": {"token": token}})


@app.get("/api/gmail/messages")
def gmail_messages(email: str, user=Depends(current_user)):
    connection = get_gmail_connection(email)
    if not connection:
        return {"success": False, "message": "Gmail is not connected"}
    credentials = Credentials(token=connection.get("token"), refresh_token=connection.get("refresh_token"), token_uri="https://oauth2.googleapis.com/token", scopes=GMAIL_SCOPES)
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
        save_gmail_token(email, credentials.token)
    service = build("gmail", "v1", credentials=credentials)
    result = service.users().messages().list(userId="me", maxResults=20).execute()
    output = []
    for item in result.get("messages", []):
        message = service.users().messages().get(userId="me", id=item["id"], format="metadata", metadataHeaders=["Subject", "From", "Date"]).execute()
        headers = {h["name"]: h["value"] for h in message["payload"].get("headers", [])}
        output.append({"id": item["id"], "subject": headers.get("Subject", ""), "sender": headers.get("From", ""), "date": headers.get("Date", "")})
    return {"success": True, "email": email, "count": len(output), "messages": output}


@app.post("/api/whatsapp/webhook")
def whatsapp_webhook(d: IncomingMessage):
    return {"success": True, "message": "WhatsApp webhook ready", "received": d.model_dump()}
