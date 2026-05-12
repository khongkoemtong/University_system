import { clearAuthSession, getAuthSession } from "../auth/authSession";
import "./user-dashboard.css";

const weeklySchedule = [
  { day: "Mon", subject: "Web Design", time: "08:00 - 09:30", room: "Lab A2", tone: "mint" },
  { day: "Tue", subject: "Database System", time: "10:00 - 11:30", room: "Room B4", tone: "blue" },
  { day: "Wed", subject: "Software Engineering", time: "13:00 - 14:30", room: "Hall C1", tone: "gold" },
  { day: "Thu", subject: "Network Basics", time: "09:00 - 10:30", room: "Room D2", tone: "coral" },
];

const courseProgress = [
  { name: "Frontend Development", progress: 82, accent: "mint" },
  { name: "Database Modeling", progress: 74, accent: "blue" },
  { name: "Object Oriented Programming", progress: 91, accent: "gold" },
];

const activityFeed = [
  { title: "Assignment uploaded", detail: "Database ERD submitted successfully.", time: "12 min ago" },
  { title: "Attendance marked", detail: "You were present in Software Engineering.", time: "Today" },
  { title: "New notice", detail: "Midterm schedule was posted by academic office.", time: "Yesterday" },
];

function getInitials(name) {
  return String(name || "Student")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function UserDashboard() {
  const session = getAuthSession();
  const student = session?.student || {};
  const user = session?.user || {};
  const displayName = user.name || student.name || "Student";
  const initials = getInitials(displayName);
  const classLabel = student.class_name || "Not assigned yet";
  const studentCode = student.student_code || "Pending";
  const email = user.email || student.email || "No email";

  function handleSignOut() {
    clearAuthSession();
    window.location.href = "/sign-in";
  }

  return (
    <main className="student-shell">
      <section className="student-dashboard">
        <section className="student-hero">
          <div className="student-hero-copy">
            <span className="student-kicker">Student Account</span>
            <h1>Welcome back, {displayName}.</h1>
            <p>
              Your student space is ready with class details, weekly schedule, learning progress, and quick updates in
              one place.
            </p>

            <div className="student-hero-actions">
              <div className="student-chip">
                <span className="student-chip-label">Student Code</span>
                <strong>{studentCode}</strong>
              </div>
              <div className="student-chip">
                <span className="student-chip-label">Class</span>
                <strong>{classLabel}</strong>
              </div>
            </div>
          </div>

          <div className="student-profile-card">
            <div className="student-profile-top">
              <div className="student-avatar">{initials}</div>
              <div>
                <strong>{displayName}</strong>
                <p>{email}</p>
              </div>
            </div>

            <div className="student-profile-grid">
              <article>
                <span>Attendance</span>
                <strong>96%</strong>
              </article>
              <article>
                <span>Average</span>
                <strong>A-</strong>
              </article>
              <article>
                <span>Tasks Left</span>
                <strong>4</strong>
              </article>
              <article>
                <span>Phone</span>
                <strong>{student.phone || "N/A"}</strong>
              </article>
            </div>

            <button type="button" className="student-signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </section>

        <section className="student-stat-grid">
          <article className="student-stat-card is-highlight">
            <span>Current Semester</span>
            <strong>Spring 2026</strong>
            <p>Stay consistent and keep your performance strong.</p>
          </article>
          <article className="student-stat-card">
            <span>Courses Active</span>
            <strong>6</strong>
            <p>Three theory and three lab-focused classes.</p>
          </article>
          <article className="student-stat-card">
            <span>Upcoming Quiz</span>
            <strong>2 Days</strong>
            <p>Database System short quiz on normalization.</p>
          </article>
          <article className="student-stat-card">
            <span>Completed Tasks</span>
            <strong>18</strong>
            <p>Great pace this week across your subjects.</p>
          </article>
        </section>

        <section className="student-main-grid">
          <article className="student-panel">
            <div className="student-panel-head">
              <div>
                <span className="student-section-label">Weekly Schedule</span>
                <h2>Next classes lined up</h2>
              </div>
              <strong className="student-soft-badge">Live plan</strong>
            </div>

            <div className="student-schedule-list">
              {weeklySchedule.map((item) => (
                <article key={`${item.day}-${item.subject}`} className={`student-schedule-item is-${item.tone}`}>
                  <div className="student-schedule-day">{item.day}</div>
                  <div className="student-schedule-meta">
                    <strong>{item.subject}</strong>
                    <p>
                      {item.time} · {item.room}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="student-panel">
            <div className="student-panel-head">
              <div>
                <span className="student-section-label">Progress</span>
                <h2>Course momentum</h2>
              </div>
            </div>

            <div className="student-progress-list">
              {courseProgress.map((course) => (
                <article key={course.name} className="student-progress-item">
                  <div className="student-progress-top">
                    <strong>{course.name}</strong>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="student-progress-bar">
                    <span className={`is-${course.accent}`} style={{ width: `${course.progress}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="student-bottom-grid">
          <article className="student-panel">
            <div className="student-panel-head">
              <div>
                <span className="student-section-label">Recent Activity</span>
                <h2>What changed today</h2>
              </div>
            </div>

            <div className="student-activity-list">
              {activityFeed.map((item) => (
                <article key={item.title} className="student-activity-item">
                  <div className="student-activity-dot" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span>{item.time}</span>
                </article>
              ))}
            </div>
          </article>

          <article className="student-panel student-focus-panel">
            <div className="student-panel-head">
              <div>
                <span className="student-section-label">Student Details</span>
                <h2>Your account card</h2>
              </div>
            </div>

            <div className="student-detail-list">
              <article>
                <span>Full Name</span>
                <strong>{displayName}</strong>
              </article>
              <article>
                <span>Email</span>
                <strong>{email}</strong>
              </article>
              <article>
                <span>Student Code</span>
                <strong>{studentCode}</strong>
              </article>
              <article>
                <span>Class</span>
                <strong>{classLabel}</strong>
              </article>
              <article>
                <span>Gender</span>
                <strong>{student.gender || "N/A"}</strong>
              </article>
              <article>
                <span>Address</span>
                <strong>{student.address || "N/A"}</strong>
              </article>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
