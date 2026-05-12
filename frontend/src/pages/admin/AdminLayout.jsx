import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "./admin-dashboard.css";
import { clearAuthSession, getAuthSession } from "../auth/authSession";
import { fetchAccessRequests, reviewAccessRequest } from "../auth/authApi";
import { adminNavItems, announcements, staffReports } from "./adminData";

function Icon({ type }) {
  const icons = {
    grid: (
      <>
        <span />
        <span />
        <span />
        <span />
      </>
    ),
    message: <span className="ui-line" />,
    calendar: (
      <>
        <span className="ui-line ui-line-top" />
        <span className="ui-line" />
      </>
    ),
    file: (
      <>
        <span className="ui-line ui-line-short" />
        <span className="ui-line" />
      </>
    ),
    chart: (
      <>
        <span className="ui-bar ui-bar-sm" />
        <span className="ui-bar ui-bar-md" />
        <span className="ui-bar ui-bar-lg" />
      </>
    ),
    gear: (
      <>
        <span className="ui-gear-center" />
        <span className="ui-gear-ring" />
      </>
    ),
    student: (
      <>
        <span className="ui-person-head" />
        <span className="ui-person-body" />
      </>
    ),
    teacher: (
      <>
        <span className="ui-board" />
        <span className="ui-line ui-line-board" />
      </>
    ),
    classroom: (
      <>
        <span className="ui-board" />
        <span className="ui-line ui-line-board" />
        <span className="ui-class-dot" />
      </>
    ),
    course: (
      <>
        <span className="ui-book-cover" />
        <span className="ui-book-line ui-book-line-top" />
        <span className="ui-book-line ui-book-line-bottom" />
      </>
    ),
    staff: (
      <>
        <span className="ui-card-line" />
        <span className="ui-card-line ui-card-line-short" />
      </>
    ),
    bell: (
      <>
        <span className="ui-bell-body" />
        <span className="ui-bell-clapper" />
      </>
    ),
  };

  return <span className={`admin-ui-icon admin-ui-icon-${type}`}>{icons[type]}</span>;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("admin-theme") || "light";
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accessRequests, setAccessRequests] = useState([]);
  const [reviewingRequestId, setReviewingRequestId] = useState(0);
  const location = useLocation();
  const notificationRef = useRef(null);
  const session = getAuthSession();
  const authUser = session?.user || null;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadAccessRequests() {
      try {
        const requests = await fetchAccessRequests();
        if (!isCancelled) {
          setAccessRequests(Array.isArray(requests) ? requests : []);
        }
      } catch {
        if (!isCancelled) {
          setAccessRequests([]);
        }
      }
    }

    loadAccessRequests();
    const timer = window.setInterval(loadAccessRequests, 15000);

    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem("admin-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (location.pathname.startsWith("/admin/students/")) return "Students";
    if (location.pathname.startsWith("/admin/students")) return "Students";
    if (location.pathname.startsWith("/admin/staff/")) return "Staff";
    if (location.pathname.startsWith("/admin/staff")) return "Staff";
    if (location.pathname.startsWith("/admin/classes")) return "Classes";
    if (location.pathname.startsWith("/admin/courses")) return "Courses";
    if (location.pathname.startsWith("/admin/report/")) return "Report";
    if (location.pathname.startsWith("/admin/report")) return "Report";
    if (location.pathname.startsWith("/admin/database")) return "Database";
    if (location.pathname.startsWith("/admin/attendance")) return "Attendance";
    if (location.pathname.startsWith("/admin/settings")) return "Settings";
    return "Dashboard";
  }, [location.pathname]);

  const headerDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const headerTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const notifications = useMemo(
    () => [
      ...accessRequests.map((item) => ({
        id: `request-${item.id}`,
        requestId: item.id,
        title: `${item.account_type === "admin" ? "Admin" : "Staff"} Access Request`,
        detail: [
          item.name,
          item.email,
          item.position || item.account_type,
          item.staff_code || null,
        ]
          .filter(Boolean)
          .join(" • "),
        tone: "approval",
        time: item.created_at ? new Date(item.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now",
        role: item.account_type === "admin" ? "Admin" : "Staff",
        status: item.status,
      })),
      ...announcements.map((item, index) => ({
        id: `announcement-${index}`,
        title: item.title,
        detail: item.detail,
        tone: "system",
        time: "Just now",
      })),
      ...staffReports.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        detail: `${item.staffName} • ${item.status}`,
        tone: "report",
        time: item.time,
      })),
    ],
    [accessRequests],
  );

  function handleLogout() {
    clearAuthSession();
    navigate("/sign-in", { replace: true });
  }

  async function handleReviewRequest(requestId, action) {
    setReviewingRequestId(requestId);

    try {
      await reviewAccessRequest({
        id: requestId,
        action,
      });

      const requests = await fetchAccessRequests();
      setAccessRequests(Array.isArray(requests) ? requests : []);
    } finally {
      setReviewingRequestId(0);
    }
  }

  if (!authUser || String(authUser.role_name || "").toLowerCase() !== "admin") {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <main className={`admin-dashboard-shell theme-${theme}`}>
      <section className="admin-dashboard-frame">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="admin-brand-mark">
              <span />
              <span />
            </div>
            <h1>School</h1>
          </div>

          <nav className="admin-nav">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => (isActive ? "is-active" : "")}
              >
                <span className="admin-nav-icon">
                  <Icon type={item.icon} />
                </span>
                <span>{item.label}</span>
                {item.badge ? <em>{item.badge}</em> : null}
              </NavLink>
            ))}
          </nav>

          <section className="admin-session-card">
            <div className="admin-session-avatar">
              {String(authUser.name || "AD")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="admin-session-meta">
              <strong>{authUser.name}</strong>
              <span>{authUser.email}</span>
              <small>{authUser.role_name} account</small>
            </div>
            <button type="button" className="admin-session-logout" onClick={handleLogout}>
              Logout
            </button>
          </section>
        </aside>

        <section className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-primary">
              <label className="admin-search">
                <span>⌕</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search for student, teacher, document..."
                />
              </label>

              <div className="admin-live-time">
                <strong>{headerTime}</strong>
                <span>{headerDate}</span>
              </div>
            </div>

            <div className="admin-topbar-actions">
              <div ref={notificationRef} className={`admin-notification-wrap${notificationOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="admin-notify"
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                  onClick={() => setNotificationOpen((value) => !value)}
                >
                  <span className="admin-bell-icon" aria-hidden="true">
                    <Icon type="bell" />
                  </span>
                  <em>{notifications.length}</em>
                </button>

                <div className="admin-notification-modal" role="dialog" aria-label="Notifications panel">
                  <div className="admin-notification-modal-head">
                    <div>
                      <strong>Approval & Notifications</strong>
                      <p>{notifications.length} updates waiting for review</p>
                    </div>
                    <span className="admin-status-pill">{notifications.length} new</span>
                  </div>

                  <div className="admin-notification-highlight">
                    <strong>Pending Access Approval</strong>
                    <p>Review people who want to become staff or admin from this inbox.</p>
                  </div>

                  <div className="admin-notification-list">
                    {notifications.map((item) => (
                      <article key={item.id} className={`admin-notification-item tone-${item.tone}`}>
                        <div className="admin-notification-dot" aria-hidden="true" />
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                          <small>{item.time}</small>
                          {item.tone === "approval" ? (
                            <div className="admin-notification-actions">
                              <span className="admin-notification-role">
                                {item.status === "pending" ? `${item.role} Request` : `${item.role} ${item.status}`}
                              </span>
                              <div className="admin-notification-action-group">
                                {item.status === "pending" ? (
                                  <>
                                    <button
                                      type="button"
                                      className="admin-notification-btn is-approve"
                                      disabled={reviewingRequestId === item.requestId}
                                      onClick={() => handleReviewRequest(item.requestId, "approve")}
                                    >
                                      {reviewingRequestId === item.requestId ? "Saving..." : "Approve"}
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-notification-btn is-decline"
                                      disabled={reviewingRequestId === item.requestId}
                                      onClick={() => handleReviewRequest(item.requestId, "decline")}
                                    >
                                      Decline
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-profile">
                <div className="admin-avatar">
                  {String(authUser.name || "AD")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="admin-profile-meta">
                  <span>{authUser.name}</span>
                  <small>{pageTitle} Control • {authUser.email}</small>
                </div>
              </div>
            </div>
          </header>

          <div className="admin-content">
            <div className="admin-center">
              <Outlet
                context={{
                  currentTime,
                  searchTerm,
                  pageTitle,
                  iconMap: Icon,
                  theme,
                  setTheme,
                  authUser,
                }}
              />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
