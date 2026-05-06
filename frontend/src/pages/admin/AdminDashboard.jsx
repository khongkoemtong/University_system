import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  announcements,
  attendanceTrend,
  productivity,
  quickStatsBase,
  staffMembers,
  students,
  teachers,
} from "./adminData";

function buildLinePath(values) {
  if (!values.length) {
    return "";
  }

  const max = 100;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 96 + 2;
      const y = 100 - (value / max) * 80 - 10;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function DashboardTable({ searchTerm }) {
  const [tab, setTab] = useState("students");

  const tabs = {
    students: {
      label: "Student",
      rows: students,
      columns: ["Name", "ID", "Class", "Age", "Gender", "Email"],
      render: (row, index) => (
        <tr key={row.id}>
          <td>
            <div className="admin-student-cell">
              <span className={`avatar-tone-${(index % 3) + 1}`}>
                {row.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <p>{row.name}</p>
            </div>
          </td>
          <td>{row.id}</td>
          <td>{row.className}</td>
          <td>{row.age}</td>
          <td>{row.gender}</td>
          <td>{row.email}</td>
        </tr>
      ),
      filter: (row, term) =>
        [row.name, row.id, row.className, row.email].some((value) =>
          value.toLowerCase().includes(term),
        ),
    },
    teachers: {
      label: "Teacher",
      rows: teachers,
      columns: ["Name", "Subject", "Room", "Status"],
      render: (row, index) => (
        <tr key={row.name}>
          <td>
            <div className="admin-student-cell">
              <span className={`avatar-tone-${(index % 3) + 1}`}>
                {row.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <p>{row.name}</p>
            </div>
          </td>
          <td>{row.subject}</td>
          <td>{row.room}</td>
          <td>{row.status}</td>
        </tr>
      ),
      filter: (row, term) =>
        [row.name, row.subject, row.room, row.status].some((value) =>
          value.toLowerCase().includes(term),
        ),
    },
    staff: {
      label: "Staff",
      rows: staffMembers,
      columns: ["Name", "Role", "Shift", "Status"],
      render: (row, index) => (
        <tr key={row.name}>
          <td>
            <div className="admin-student-cell">
              <span className={`avatar-tone-${(index % 3) + 1}`}>
                {row.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <p>{row.name}</p>
            </div>
          </td>
          <td>{row.role}</td>
          <td>{row.shift}</td>
          <td>{row.status}</td>
        </tr>
      ),
      filter: (row, term) =>
        [row.name, row.role, row.shift, row.status].some((value) =>
          value.toLowerCase().includes(term),
        ),
    },
  };

  const activeTab = tabs[tab];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const rows = normalizedSearch
    ? activeTab.rows.filter((row) => activeTab.filter(row, normalizedSearch))
    : activeTab.rows;

  return (
    <article className="admin-panel admin-table-panel">
      <div className="admin-panel-head">
        <div className="admin-tabs">
          {Object.entries(tabs).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "is-active" : ""}
              onClick={() => setTab(key)}
            >
              {value.label}
            </button>
          ))}
        </div>
        <span className="admin-muted-copy">{rows.length} results</span>
      </div>

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              {activeTab.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => activeTab.render(row, index))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const { currentTime, searchTerm, pageTitle, iconMap: Icon } = useOutletContext();
  const [liveTick, setLiveTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveTick((value) => value + 1);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const liveStats = useMemo(
    () =>
      quickStatsBase.map((item, index) => ({
        ...item,
        value: item.value + ((liveTick + index) % 4),
      })),
    [liveTick],
  );

  const liveAttendance = useMemo(
    () => attendanceTrend.map((point, index) => point + ((liveTick + index) % 3) - 1),
    [liveTick],
  );

  const linePath = useMemo(() => buildLinePath(liveAttendance), [liveAttendance]);
  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const onlineUsers = 128 + (liveTick % 9);

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          
          <p>Live campus snapshot updated automatically at {nowLabel}.</p>
        </div>
       
      </div>

      <div className="admin-stats">
        {liveStats.map((stat) => (
          <article key={stat.label} className="admin-stat-card">
            <div className={`admin-stat-icon tone-${stat.tone}`}>
              <Icon type={stat.icon} />
            </div>
            <div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <small>{stat.delta}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="admin-panels">
        <article className="admin-panel admin-attendance-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Attendance Overview</h3>
              <p className="admin-muted-copy">Tracking classroom participation in real time.</p>
            </div>
            <div className="admin-status-pill is-soft">Today {liveAttendance.at(-1)}%</div>
          </div>

          <div className="admin-attendance-chart">
            <div className="admin-y-axis">
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            <div className="admin-chart-canvas">
              <div className="admin-grid-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="admin-line-chart"
                aria-hidden="true"
              >
                <path d={linePath} />
              </svg>

              <div className="admin-chart-dots">
                {liveAttendance.map((value, index) => (
                  <span
                    key={`${index}-${value}`}
                    style={{
                      left: `${(index / (liveAttendance.length - 1)) * 96 + 2}%`,
                      bottom: `${(value / 100) * 80 + 10}%`,
                    }}
                  />
                ))}
              </div>

              <div className="admin-tooltip" style={{ left: "62%", bottom: "56%" }}>
                <small>{nowLabel}</small>
                <strong>{liveAttendance[11]}%</strong>
              </div>
            </div>
          </div>

          <div className="admin-months">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
          </div>
        </article>

        <article className="admin-panel admin-productivity-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Productivity</h3>
              <p className="admin-muted-copy">Task completion by month.</p>
            </div>
            <span className="admin-status-pill is-soft">Syncing</span>
          </div>

          <div className="admin-productivity-chart">
            <div className="admin-productivity-bars">
              {productivity.map((item) => {
                const currentValue = item.value + (liveTick % 3);
                return (
                  <div key={item.month} className="admin-productivity-bar-group">
                    <div
                      className={[
                        "admin-productivity-bar",
                        item.tone === "strong" ? "is-strong" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ height: `${currentValue * 4}px` }}
                    >
                      {item.tone === "strong" ? (
                        <div className="admin-productivity-tooltip">
                          <small>Tasks Done</small>
                          <strong>{currentValue}</strong>
                        </div>
                      ) : null}
                    </div>
                    <span>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </div>

      <div className="admin-dual-grid">
        <DashboardTable searchTerm={searchTerm} />

        <article className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Recent Activity</h3>
              <p className="admin-muted-copy">Search-aware operational updates.</p>
            </div>
          </div>

          <div className="admin-activity-list">
            {announcements
              .filter((item) => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                return `${item.title} ${item.detail}`.toLowerCase().includes(term);
              })
              .map((item) => (
                <article key={item.title} className="admin-activity-item">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
          </div>
        </article>
      </div>
    </section>
  );
}
