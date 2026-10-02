import { useState, useEffect } from "react";
import "./App.css";

function StudyBuddy() {
  return (
    <div className="buddy-area">
      <div className="speech-bubble">Ready when you are.</div>
      <div className="buddy-shadow"></div>

      <div className="buddy">
        <div className="ear ear-left"></div>
        <div className="ear ear-right"></div>

        <div className="buddy-head">
          <div className="face">
            <div className="eye eye-left"></div>
            <div className="eye eye-right"></div>
            <div className="nose"></div>
            <div className="smile"></div>
          </div>
        </div>

        <div className="buddy-body">
          <div className="belly"></div>
          <div className="book">✦</div>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ backendStatus, user }) {
  return (
    <>
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">TUESDAY · SEPTEMBER 29</p>

          <h1>
            Good afternoon, <span>Nikitha.</span>
          </h1>

          <p className="dashboard-subtitle">
            Here's what needs your attention today.
          </p>

          <div className="backend-status">
            ● Backend: {backendStatus}
          </div>
        </div>

        <div className="header-profile">
          <div className="student-avatar">{(user?.name || "S")[0].toUpperCase()}</div>
          <span>Nikitha</span>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card stat-pink">
          <div className="stat-icon">✓</div>
          <div>
            <small>Tasks Today</small>
            <strong>5</strong>
          </div>
        </div>

        <div className="stat-card stat-rose">
          <div className="stat-icon">◷</div>
          <div>
            <small>Study Hours</small>
            <strong>3.5h</strong>
          </div>
        </div>

        <div className="stat-card stat-cream">
          <div className="stat-icon">!</div>
          <div>
            <small>Deadlines</small>
            <strong>2</strong>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">★</div>
          <div>
            <small>Semester Health</small>
            <strong>82%</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="tasks-card">
          <div className="card-header">
            <div>
              <p className="dashboard-label">PRIORITY</p>
              <h2>What needs your attention?</h2>
            </div>

            <span className="item-count">3 items</span>
          </div>

          <div className="task-item">
            <span className="task-number">01</span>

            <div className="task-info">
              <strong>DBMS Assignment</strong>
              <small>Due tomorrow · High priority</small>
            </div>

            <span className="task-arrow">→</span>
          </div>

          <div className="task-item">
            <span className="task-number">02</span>

            <div className="task-info">
              <strong>DSA Lab Preparation</strong>
              <small>Due in 2 days · Medium priority</small>
            </div>

            <span className="task-arrow">→</span>
          </div>

          <div className="task-item">
            <span className="task-number">03</span>

            <div className="task-info">
              <strong>Project Meeting</strong>
              <small>Today · 4:30 PM</small>
            </div>

            <span className="task-arrow">→</span>
          </div>
        </div>

        <div className="dashboard-buddy-card">
          <p className="dashboard-label">ACADEMIC GUARDIAN</p>

          <h2>Stay focused.</h2>

          <p>
            One task at a time.
            <br />
            No distractions.
          </p>

          <div className="mini-buddy">
            <div className="mini-ear mini-ear-left"></div>
            <div className="mini-ear mini-ear-right"></div>

            <div className="mini-head">
              <div className="mini-face">
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="mini-body">
              <div className="mini-book">✦</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="progress-card">
          <p className="dashboard-label">WEEKLY PROGRESS</p>

          <h2>Your study rhythm</h2>

          <div className="progress-bar">
            <div></div>
          </div>

          <div className="progress-info">
            <strong>68%</strong>
            <span>of your weekly goal</span>
          </div>
        </div>

        <div className="quote-card">
          <div className="quote-symbol">✦</div>

          <p>
            Stay consistent.
            <br />
            Small progress adds up.
          </p>

          <small>— CampusFlow</small>
        </div>
      </section>
    </>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "DBMS Assignment",
      subject: "DBMS",
      deadline: "Tomorrow · 5 PM",
      priority: "High",
      completed: false,
    },
    {
      id: 2,
      title: "DSA Lab Preparation",
      subject: "DSA",
      deadline: "October 1",
      priority: "Medium",
      completed: false,
    },
    {
      id: 3,
      title: "Project Meeting",
      subject: "CampusFlow",
      deadline: "Today · 4:30 PM",
      priority: "High",
      completed: false,
    },
    {
      id: 4,
      title: "OS Assignment",
      subject: "Operating Systems",
      deadline: "October 4",
      priority: "Medium",
      completed: false,
    },
  ]);

  function toggleTask(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <div>
      <p className="dashboard-label">YOUR WORKSPACE</p>

      <h1 className="page-title">Tasks</h1>

      <p className="page-description">
        Everything you need to complete, in one place.
      </p>

      <div className="task-summary">
        <strong>
          {completedCount}/{tasks.length}
        </strong>

        <span>tasks completed</span>
      </div>

      <div className="task-page">
        {tasks.map((task) => (
          <div
            className={
              task.completed
                ? "full-task completed-task"
                : "full-task"
            }
            key={task.id}
          >
            <button
              className="task-checkbox"
              onClick={() => toggleTask(task.id)}
            >
              {task.completed ? "✓" : ""}
            </button>

            <div className="full-task-info">
              <strong>{task.title}</strong>
              <span>
                {task.subject} · {task.deadline}
              </span>
            </div>

            <span
              className={
                task.priority === "High"
                  ? "priority-high"
                  : "priority-medium"
              }
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Inbox() {
  const [addedItems, setAddedItems] = useState([]);

  function addItem(item) {
    setAddedItems((current) =>
      current.includes(item)
        ? current
        : [...current, item]
    );
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <p className="dashboard-label">INFORMATION HUB</p>

          <h1 className="page-title">
            Information Inbox
          </h1>

          <p className="page-description">
            Important information collected from your
            student life.
          </p>
        </div>

        <div className="inbox-status">
          ● Monitoring
        </div>
      </div>

      <div className="source-row">
        <div className="source-chip active-source">
          ◉ WhatsApp
        </div>

        <div className="source-chip">✉ Email</div>
        <div className="source-chip">◷ Calendar</div>
        <div className="source-chip">▣ College LMS</div>
      </div>

      <div className="information-card">
        <div className="information-header">
          <div className="source-title">
            <div className="source-icon whatsapp-icon">
              W
            </div>

            <div>
              <strong>Class WhatsApp Group</strong>
              <small>Today · 10:32 AM</small>
            </div>
          </div>

          <span className="detected">
            IMPORTANT
          </span>
        </div>

        <div className="message-box">
          <p>
            DBMS assignment has to be submitted by
            tomorrow. Sir said everyone must upload it
            before 5 PM.
          </p>
        </div>

        <div className="ai-result">
          <div className="ai-heading">
            ✨ Important information detected
          </div>

          <div className="detected-grid">
            <div>
              <small>TYPE</small>
              <strong>Assignment</strong>
            </div>

            <div>
              <small>SUBJECT</small>
              <strong>DBMS</strong>
            </div>

            <div>
              <small>DEADLINE</small>
              <strong>Tomorrow · 5 PM</strong>
            </div>

            <div>
              <small>PRIORITY</small>
              <strong className="high-priority">
                High
              </strong>
            </div>
          </div>

          <button
            className="add-task-button"
            onClick={() =>
              addItem("DBMS Assignment")
            }
          >
            ✓ Add to Tasks
          </button>
        </div>
      </div>

      <div className="information-card">
        <div className="information-header">
          <div className="source-title">
            <div className="source-icon email-icon">
              @
            </div>

            <div>
              <strong>College Email</strong>
              <small>Yesterday · 6:14 PM</small>
            </div>
          </div>

          <span className="detected">
            IMPORTANT
          </span>
        </div>

        <div className="message-box">
          <p>
            Internal Assessment Schedule — DBMS
            Internal Assessment will be conducted on
            October 3.
          </p>
        </div>

        <div className="ai-result">
          <div className="ai-heading">
            ✨ Important information detected
          </div>

          <div className="detected-grid">
            <div>
              <small>TYPE</small>
              <strong>Examination</strong>
            </div>

            <div>
              <small>SUBJECT</small>
              <strong>DBMS</strong>
            </div>

            <div>
              <small>DATE</small>
              <strong>October 3</strong>
            </div>

            <div>
              <small>PRIORITY</small>
              <strong>High</strong>
            </div>
          </div>

          <button
            className="add-task-button secondary"
            onClick={() =>
              addItem("DBMS Internal Assessment")
            }
          >
            + Add to Calendar
          </button>
        </div>
      </div>

      {addedItems.length > 0 && (
        <div className="added-section">
          <p className="dashboard-label">
            ADDED TO CAMPUSFLOW
          </p>

          {addedItems.map((item, index) => (
            <div className="added-item" key={index}>
              ✓ {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Calendar() {
  return (
    <div>
      <p className="dashboard-label">
        YOUR SCHEDULE
      </p>

      <h1 className="page-title">Calendar</h1>

      <p className="page-description">
        Important academic events detected by
        CampusFlow.
      </p>

      <div className="calendar-grid">
        <div className="calendar-event event-pink">
          <span>OCT</span>

          <div>
            <strong>03</strong>
            <p>DBMS Internal Assessment</p>
            <small>
              10:00 AM · Room 204
            </small>
          </div>
        </div>

        <div className="calendar-event event-green">
          <span>OCT</span>

          <div>
            <strong>04</strong>
            <p>OS Assignment Deadline</p>
            <small>
              Submission by 5:00 PM
            </small>
          </div>
        </div>

        <div className="calendar-event event-cream">
          <span>OCT</span>

          <div>
            <strong>06</strong>
            <p>CampusFlow Project Meeting</p>
            <small>
              4:30 PM · Project Lab
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskRadar() {
  return (
    <div>
      <p className="dashboard-label">
        ACADEMIC HEALTH
      </p>

      <h1 className="page-title">
        Risk Radar
      </h1>

      <p className="page-description">
        Potential academic risks that may need your
        attention.
      </p>

      <div className="risk-grid">
        <div className="risk-card risk-high">
          <div className="risk-icon">!</div>

          <div>
            <span>HIGH ATTENTION</span>
            <h2>DBMS deadline</h2>
            <p>
              Assignment is due tomorrow and has not
              been completed.
            </p>
          </div>
        </div>

        <div className="risk-card risk-medium">
          <div className="risk-icon">◷</div>

          <div>
            <span>MEDIUM ATTENTION</span>
            <h2>Study workload</h2>
            <p>
              Several assignments are due within the
              next 7 days.
            </p>
          </div>
        </div>

        <div className="risk-card risk-low">
          <div className="risk-icon">✓</div>

          <div>
            <span>STABLE</span>
            <h2>Semester health</h2>
            <p>
              Your current progress is at 82%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Goals() {
  return (
    <div>
      <p className="dashboard-label">
        LONG TERM
      </p>

      <h1 className="page-title">Goals</h1>

      <p className="page-description">
        Turn your academic goals into actionable
        plans.
      </p>

      <div className="goal-card">
        <div className="goal-top">
          <div>
            <span>SEMESTER GOAL</span>
            <h2>Maintain 8.5+ SGPA</h2>
          </div>

          <strong>72%</strong>
        </div>

        <div className="goal-bar">
          <div></div>
        </div>

        <p>
          Keep your assignments, attendance and exam
          preparation on track.
        </p>
      </div>

      <div className="goal-card green-goal">
        <div className="goal-top">
          <div>
            <span>PROJECT GOAL</span>
            <h2>Complete CampusFlow MVP</h2>
          </div>

          <strong>45%</strong>
        </div>

        <div className="goal-bar">
          <div></div>
        </div>

        <p>
          Complete frontend, backend, database and
          integrations.
        </p>
      </div>
    </div>
  );
}

function Dashboard({ logout, backendStatus, user }) {
  const [activePage, setActivePage] =
    useState("dashboard");

  function renderPage() {
    if (activePage === "tasks") {
      return <Tasks />;
    }

    if (activePage === "inbox") {
      return <Inbox />;
    }

    if (activePage === "calendar") {
      return <Calendar />;
    }

    if (activePage === "risk") {
      return <RiskRadar />;
    }

    if (activePage === "goals") {
      return <Goals />;
    }

    return (
      <DashboardHome
        backendStatus={backendStatus}
        user={user}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="dashboard-logo">
          <div className="logo-icon">✦</div>
          <span>CampusFlow</span>
        </div>

        <div className="student-box">
          <div className="student-avatar">{(user?.name || "S")[0].toUpperCase()}</div>

          <div>
            <strong>{user?.name || "Student"}</strong>
            <small>Student</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={
              activePage === "dashboard"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            ◈ &nbsp; Dashboard
          </button>

          <button
            className={
              activePage === "tasks"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("tasks")
            }
          >
            ✓ &nbsp; Tasks
          </button>

          <button
            className={
              activePage === "calendar"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("calendar")
            }
          >
            ◷ &nbsp; Calendar
          </button>

          <button
            className={
              activePage === "inbox"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("inbox")
            }
          >
            ✉ &nbsp; Inbox
          </button>

          <button
            className={
              activePage === "risk"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("risk")
            }
          >
            ◇ &nbsp; Risk Radar
          </button>

          <button
            className={
              activePage === "goals"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setActivePage("goals")
            }
          >
            ☆ &nbsp; Goals
          </button>
        </nav>

        <button
          className="logout-button"
          onClick={logout}
        >
          ↪ &nbsp; Logout
        </button>
      </aside>

      <main className="dashboard-main">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name:"", usn:"", email:"", password:"", confirm_password:"", login:""});
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("campusflow_token"));
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  useEffect(() => {
    fetch(`${API}/api/health`).then(r => r.json()).then(d => setBackendStatus(d.status === "online" ? "Online" : "Offline")).catch(() => setBackendStatus("Offline"));
    const token = localStorage.getItem("campusflow_token");
    if (token) fetch(`${API}/api/auth/me`, {headers:{Authorization:`Bearer ${token}`}}).then(r => r.ok ? r.json() : Promise.reject()).then(d => setUser(d)).catch(() => { localStorage.removeItem("campusflow_token"); setLoggedIn(false); });
  }, []);

  function update(field, value) { setForm({...form, [field]: value}); }

  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "register" ? form : {login: form.login, password: form.password};
      const response = await fetch(API + endpoint, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Something went wrong");
      if (mode === "register") { setMode("login"); setForm({...form, login:form.usn, password:"", confirm_password:""}); setError("Account created! Please log in."); }
      else { localStorage.setItem("campusflow_token", data.token); setUser(data.user); setLoggedIn(true); }
    } catch (e) { setError(e.message); }
  }

  function logout() { localStorage.removeItem("campusflow_token"); setLoggedIn(false); setUser(null); setForm({name:"",usn:"",email:"",password:"",confirm_password:"",login:""}); }

  if (loggedIn) return <Dashboard logout={logout} backendStatus={backendStatus} user={user} />;

  const register = mode === "register";
  return (
    <div className="login-page">
      <section className="login-left">
        <div className="logo"><div className="logo-icon">✦</div><span>CampusFlow</span></div>
        <div className="hero"><p className="small-label">YOUR ACADEMIC COMMAND CENTER</p><h1>Study smart.<br/><span>Stress less.</span></h1><p className="hero-description">Everything happening in your student life, organized into one intelligent workspace.</p></div>
        <StudyBuddy />
      </section>
      <section className="login-right">
        <div className="login-card">
          <div className="welcome">{register ? "CREATE ACCOUNT" : "WELCOME BACK"}</div>
          <h2>{register ? <>Join <span>CampusFlow</span></> : <>Log in to<br/><span>CampusFlow</span></>}</h2>
          <p className="subtitle">{register ? "Create your personal academic workspace." : "Your academic world is waiting for you."}</p>
          <form onSubmit={handleSubmit}>
            {register && <>
              <label>Full Name</label><input required placeholder="Enter your full name" value={form.name} onChange={e=>update("name",e.target.value)} />
              <label>USN</label><input required placeholder="Enter your USN" value={form.usn} onChange={e=>update("usn",e.target.value)} />
              <label>College Email</label><input required type="email" placeholder="Enter your college email" value={form.email} onChange={e=>update("email",e.target.value)} />
            </>}
            {!register && <><label>USN or Email</label><input required placeholder="Enter your USN or email" value={form.login} onChange={e=>update("login",e.target.value)} /></>}
            <label>Password</label><input required type="password" placeholder={register ? "Create a password (8+ characters)" : "Enter your password"} value={form.password} onChange={e=>update("password",e.target.value)} />
            {register && <><label>Confirm Password</label><input required type="password" placeholder="Re-enter your password" value={form.confirm_password} onChange={e=>update("confirm_password",e.target.value)} /></>}
            {error && <div className="error">{error}</div>}
            <button type="submit" className="login-button">{register ? "CREATE ACCOUNT" : "ENTER CAMPUSFLOW"} <span>→</span></button>
          </form>
          <button type="button" className="login-button secondary" onClick={()=>{setMode(register?"login":"register");setError("")}} style={{marginTop:12}}>{register ? "Already have an account? Login" : "New student? Create an account"}</button>
          <p className="footer-text">Your academic journey, organized.</p>
        </div>
      </section>
    </div>
  );
}

export default App;
