import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "./staff-dashboard.css";
import { baseStudents, scheduleItems, staffNavItems } from "./staffData";

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
    check: <span className="staff-ui-check" />,
    student: (
      <>
        <span className="staff-ui-head" />
        <span className="staff-ui-body" />
      </>
    ),
    chart: (
      <>
        <span className="staff-ui-bar is-1" />
        <span className="staff-ui-bar is-2" />
        <span className="staff-ui-bar is-3" />
      </>
    ),
  };

  return <span className={`staff-ui-icon staff-ui-icon-${type}`}>{icons[type]}</span>;
}

export default function StaffLayout() {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarSide, setSidebarSide] = useState("left");
  const [sidebarWidth, setSidebarWidth] = useState(188);
  const frameRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const pageTitle = useMemo(() => {
    const match = staffNavItems.find((item) => item.to === location.pathname);
    if (match) return match.label;

    if (location.pathname.startsWith("/staff/manage-attendance/")) {
      return "Manage Attendance";
    }

    return "Overview";
  }, [location.pathname]);

  const isFullWidthPage = true;

  const filteredStudents = useMemo(() => {
    return baseStudents;
  }, []);

  const handleSidebarDragStart = (event) => {
    const frame = frameRef.current;
    if (!frame) return;

    event.preventDefault();

    const onPointerMove = (moveEvent) => {
      const rect = frame.getBoundingClientRect();
      const pointerX = moveEvent.clientX - rect.left;
      const frameWidth = rect.width;
      const minWidth = 148;
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
        setSidebarWidth(Math.min(maxWidth, Math.max(minWidth, frameWidth - pointerX)));
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

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

  return (
    <main className="staff-shell">
      <section
        ref={frameRef}
        className={[
          "staff-frame",
          sidebarVisible ? "" : "is-sidebar-hidden",
          sidebarSide === "right" ? "is-sidebar-right" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={sidebarVisible ? { "--staff-sidebar-width": `${sidebarWidth}px` } : undefined}
      >
        <aside className="staff-sidebar">
          <div className="staff-brand">
            <div className="staff-brand-mark">A</div>
            <h1>Attenad</h1>
          </div>

          <nav className="staff-nav">
            {staffNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => (isActive ? "is-active" : "")}
              >
                <span className="staff-nav-icon">
                  <Icon type={item.icon} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <section className="staff-side-panel">
            <div className="staff-side-panel-head">
              <h3>Live Data</h3>
              <p>Current attendance state</p>
            </div>
            <div className="staff-side-metrics">
              <article>
                <span>Students</span>
                <strong>{filteredStudents.length}</strong>
              </article>
              <article>
                <span>Present</span>
                <strong>{filteredStudents.filter((student) => student.status === "Present").length}</strong>
              </article>
              <article>
                <span>Review</span>
                <strong>
                  {filteredStudents.filter((student) => student.status !== "Present").length}
                </strong>
              </article>
            </div>
          </section>
        </aside>

        <section className="staff-main">
          <header className="staff-topbar">
            <div className="staff-topbar-title​ text-green-800 text-2xl font-bold">ឈប់ស្រលាញ់គេម្នាក់អែងទៀតទៅ ខំរៀនឡើង​ !</div>

            <div className="staff-topbar-right">
              <div className="staff-live-time">
                <strong>{headerTime}</strong>
                <span>{headerDate}</span>
              </div>
              <div className="staff-profile">
                <div className="staff-avatar">TC</div>
                <div>
                  <strong>Chris</strong>
                  <span>{pageTitle}</span>
                </div>
              </div>
            </div>
          </header>

          <div className={`staff-content${isFullWidthPage ? " is-full-width" : ""}`}>
            <div className="staff-center">
              <Outlet
                context={{
                  currentTime,
                  filteredStudents,
                  pageTitle,
                }}
              />
            </div>

            {!isFullWidthPage && (
              <aside className="staff-rightbar">
                <section className="staff-side-panel">
                  <div className="staff-side-panel-head">
                    <h3>Today Queue</h3>
                    <p>Real-time teacher agenda</p>
                  </div>
                  <div className="staff-schedule-list">
                    {scheduleItems.map((item) => (
                      <article key={item.title} className="staff-schedule-card">
                        <div className={`staff-schedule-dot tone-${item.tone}`} />
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.time}</p>
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
            "staff-sidebar-rail",
            sidebarSide === "right" ? "is-right" : "",
            sidebarVisible ? "" : "is-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          onPointerDown={handleSidebarDragStart}
          onDoubleClick={() => setSidebarVisible((value) => !value)}
          aria-label="Drag to resize, move, or hide staff sidebar"
          title="Drag to resize sidebar. Pull left to hide, or drag right to dock right."
        >
          <span />
        </button>
      </section>
    </main>
  );
}
