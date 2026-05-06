import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "./admin-dashboard.css";
import { adminNavItems, scheduleItems } from "./adminData";

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
    staff: (
      <>
        <span className="ui-card-line" />
        <span className="ui-card-line ui-card-line-short" />
      </>
    ),
  };

  return <span className={`admin-ui-icon admin-ui-icon-${type}`}>{icons[type]}</span>;
}

function buildCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({ day: prevMonthDays - i, muted: true, current: false });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ day, muted: false, current: true });
  }

  while (cells.length < 35) {
    cells.push({ day: cells.length - totalDays - startOffset + 1, muted: true, current: false });
  }

  return cells;
}

function MiniCalendar({ currentTime }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activeDay = currentTime.getDate();
  const monthLabel = currentTime.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const cells = useMemo(() => buildCalendar(currentTime), [currentTime]);

  return (
    <div className="admin-calendar">
      <div className="admin-calendar-head">
        <h3>{monthLabel}</h3>
        <div className="admin-calendar-live">
          <span className="admin-live-dot" />
          Live
        </div>
      </div>
      <div className="admin-calendar-grid admin-calendar-grid-days">
        {days.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="admin-calendar-grid admin-calendar-grid-dates">
        {cells.map((cell, index) => (
          <span
            key={`${cell.day}-${index}`}
            className={[
              cell.muted ? "is-muted" : "",
              cell.current && cell.day === activeDay ? "is-selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {cell.day}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarSide, setSidebarSide] = useState("left");
  const [sidebarWidth, setSidebarWidth] = useState(172);
  const location = useLocation();
  const frameRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const pageTitle = useMemo(() => {
    const match = adminNavItems.find((item) => item.to === location.pathname);
    if (match) return match.label;
    if (location.pathname.startsWith("/admin/staff/")) return "Staff";
    if (location.pathname.startsWith("/admin/report/")) return "Report";
    return "Dashboard";
  }, [location.pathname]);

  const isFullWidthPage = useMemo(
    () => location.pathname.startsWith("/admin/staff") || location.pathname.startsWith("/admin/report"),
    [location.pathname],
  );

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

  const handleSidebarDragStart = (event) => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    event.preventDefault();

    const onPointerMove = (moveEvent) => {
      const rect = frame.getBoundingClientRect();
      const pointerX = moveEvent.clientX - rect.left;
      const frameWidth = rect.width;
      const minWidth = 136;
      const maxWidth = Math.min(320, Math.max(220, frameWidth * 0.38));

      if (pointerX < 56) {
        setSidebarVisible(false);
        return;
      }

      if (pointerX > frameWidth - 56) {
        setSidebarVisible(true);
        setSidebarSide("right");
        setSidebarWidth(minWidth);
        return;
      }

      if (pointerX < frameWidth * 0.42) {
        setSidebarVisible(true);
        setSidebarSide("left");
        setSidebarWidth(Math.min(maxWidth, Math.max(minWidth, pointerX)));
        return;
      }

      if (pointerX > frameWidth * 0.58) {
        setSidebarVisible(true);
        setSidebarSide("right");
        setSidebarWidth(
          Math.min(maxWidth, Math.max(minWidth, frameWidth - pointerX)),
        );
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <main className="admin-dashboard-shell">
      <section
        ref={frameRef}
        className={[
          "admin-dashboard-frame",
          sidebarVisible ? "" : "is-sidebar-hidden",
          sidebarSide === "right" ? "is-sidebar-right" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          sidebarVisible
            ? { "--admin-sidebar-width": `${sidebarWidth}px` }
            : undefined
        }
      >
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
              <button type="button" className="admin-notify" aria-label="Notifications">
                <span>◌</span>
              </button>
              <div className="admin-profile">
                <div className="admin-avatar">MB</div>
                <div className="admin-profile-meta">
                  <span>Muh. Bambang</span>
                  <small>{pageTitle} Control</small>
                </div>
              </div>
            </div>
          </header>

          <div className={`admin-content${isFullWidthPage ? " is-full-width" : ""}`}>
            <div className="admin-center">
              <Outlet context={{ currentTime, searchTerm, pageTitle, iconMap: Icon }} />
            </div>

            {!isFullWidthPage && (
              <aside className="admin-rightbar">
                <MiniCalendar currentTime={currentTime} />

                <section className="admin-schedule">
                  <h3>Today Queue</h3>
                  <div className="admin-schedule-list">
                    {scheduleItems.map((item) => (
                      <article key={item.title} className="admin-schedule-card">
                        <div className={`admin-schedule-icon tone-${item.tone}`}>{item.icon}</div>
                        <div>
                          <strong>{item.title}</strong>
                          <p>
                            {item.date} at {item.time}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </aside>
            )}
          </div>
        </section>

        <button
          type="button"
          className={[
            "admin-sidebar-rail",
            sidebarSide === "right" ? "is-right" : "",
            sidebarVisible ? "" : "is-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          onPointerDown={handleSidebarDragStart}
          onDoubleClick={() => setSidebarVisible((value) => !value)}
          aria-label="Drag to resize, move, or hide sidebar"
          title="Drag to resize sidebar. Pull to left edge to hide, or to right edge to dock right."
        >
          <span />
        </button>
      </section>
    </main>
  );
}
