import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchCourses } from "./adminApi";
import { attendanceTrend, productivity } from "./adminData";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

function buildLinePath(values) {
  if (!values.length) {
    return "";
  }

  const max = 100;
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 96 + 2;
      const y = 100 - (value / max) * 80 - 10;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAttendanceSeries(students) {
  if (!students.length) {
    return attendanceTrend;
  }

  const values = students
    .map((student) => Number(student.attendance))
    .filter((value) => Number.isFinite(value))
    .slice(0, 12);

  if (!values.length) {
    return attendanceTrend;
  }

  while (values.length < 12) {
    const lastValue = values[values.length - 1] ?? 80;
    values.push(Math.max(0, Math.min(100, lastValue - 2 + (values.length % 5))));
  }

  return values;
}

function buildRecentActivity({ students, staffMembers, courses }) {
  const studentItems = students.slice(0, 3).map((student) => ({
    id: `student-${student.id}`,
    title: `${student.name} record synced`,
    detail: `${student.displayId} • ${student.className} • ${student.attendance}% attendance`,
  }));

  const staffItems = staffMembers.slice(0, 3).map((member) => ({
    id: `staff-${member.id}`,
    title: `${member.name} status updated`,
    detail: `${member.role} • ${member.office} • ${member.status}`,
  }));

  const courseItems = courses.slice(0, 3).map((course) => ({
    id: `course-${course.id}`,
    title: `${course.name} synced`,
    detail: `${course.staffCode} • ${course.position} • ${course.status}`,
  }));

  return [...staffItems, ...studentItems, ...courseItems].slice(0, 6);
}

function DashboardTable({ searchTerm, students, staffMembers, courses }) {
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
          <td>{row.displayId}</td>
          <td>{row.className}</td>
          <td>{row.age}</td>
          <td>{row.gender}</td>
          <td>{row.email}</td>
        </tr>
      ),
      filter: (row, term) =>
        [row.name, row.displayId, row.className, row.email].some((value) =>
          String(value).toLowerCase().includes(term),
        ),
    },
    courses: {
      label: "Course",
      rows: courses,
      columns: ["Name", "Lead Code", "Position", "Status"],
      render: (row, index) => (
        <tr key={row.id}>
          <td>
            <div className="admin-student-cell">
              <span className={`avatar-tone-${(index % 3) + 1}`}>
                {row.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <p>{row.name}</p>
            </div>
          </td>
          <td>{row.staffCode}</td>
          <td>{row.position}</td>
          <td>{row.status}</td>
        </tr>
      ),
      filter: (row, term) =>
        [row.name, row.staffCode, row.position, row.status].some((value) =>
          String(value).toLowerCase().includes(term),
        ),
    },
    staff: {
      label: "Staff",
      rows: staffMembers,
      columns: ["Name", "Role", "Shift", "Status"],
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
          <td>{row.role}</td>
          <td>{row.shift}</td>
          <td>{row.status}</td>
        </tr>
      ),
      filter: (row, term) =>
        [row.name, row.role, row.shift, row.status].some((value) =>
          String(value).toLowerCase().includes(term),
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
            {rows.length ? rows.map((row, index) => activeTab.render(row, index)) : (
              <tr>
                <td colSpan={activeTab.columns.length}>No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const { currentTime, searchTerm, iconMap: Icon } = useOutletContext();
  const { students, staffMembers, loading, usingFallbackData, error } = useAdminDirectoryData();
  const [courses, setCourses] = useState([]);
  const [courseError, setCourseError] = useState("");
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadCourses() {
      try {
        setCourseLoading(true);
        setCourseError("");
        const data = await fetchCourses();

        if (!isCancelled) {
          setCourses(data);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setCourseError(requestError instanceof Error ? requestError.message : "Unable to load courses");
          setCourses([]);
        }
      } finally {
        if (!isCancelled) {
          setCourseLoading(false);
        }
      }
    }

    loadCourses();

    const timer = window.setInterval(loadCourses, 30000);
    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const studentAttendancePercent = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(
      students.reduce((total, student) => total + Number(student.attendance || 0), 0) / students.length,
    );
  }, [students]);

  const studentPresentCount = useMemo(() => {
    if (!students.length) return 0;
    return students.filter((student) => Number(student.attendance || 0) >= 90).length;
  }, [students]);

  const studentAbsentCount = students.length - studentPresentCount;

  const staffPresentCount = useMemo(
    () => staffMembers.filter((member) => ["On Duty", "On Call"].includes(member.status)).length,
    [staffMembers],
  );

  const staffAbsentCount = staffMembers.length - staffPresentCount;

  const staffAttendancePercent = useMemo(() => {
    if (!staffMembers.length) return 0;
    return Math.round((staffPresentCount / staffMembers.length) * 100);
  }, [staffMembers, staffPresentCount]);

  const attendanceSeries = useMemo(() => buildAttendanceSeries(students), [students]);
  const linePath = useMemo(() => buildLinePath(attendanceSeries), [attendanceSeries]);

  const activeCourses = useMemo(
    () => courses.filter((course) => course.status === "Assigned").length,
    [courses],
  );

  const positionCount = useMemo(
    () => new Set(staffMembers.map((member) => member.roleSlug)).size,
    [staffMembers],
  );

  const liveStats = useMemo(
    () => [
      {
        label: "Students",
        value: students.length,
        tone: "green",
        icon: "student",
        delta: `${studentAttendancePercent}% avg attendance`,
      },
      {
        label: "Courses",
        value: courses.length,
        tone: "yellow",
        icon: "teacher",
        delta: `${activeCourses} assigned this cycle`,
      },
      {
        label: "Staff",
        value: staffMembers.length,
        tone: "blue",
        icon: "staff",
        delta: `${positionCount} active positions`,
      },
    ],
    [students.length, studentAttendancePercent, courses.length, activeCourses, staffMembers.length, positionCount],
  );

  const productivityData = useMemo(() => {
    const courseBase = courses.length || 1;
    const studentBase = students.length || 1;
    const staffBase = staffMembers.length || 1;

    return productivity.map((item, index) => ({
      ...item,
      value: item.value + (index === 0 ? courseBase : index === 1 ? staffBase : studentBase % 10),
    }));
  }, [courses.length, staffMembers.length, students.length]);

  const recentActivity = useMemo(
    () => buildRecentActivity({ students, staffMembers, courses }),
    [students, staffMembers, courses],
  );

  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dashboardStatus = loading || courseLoading
    ? "Loading..."
    : usingFallbackData || courseError
      ? "Partial live data"
      : "Live data";

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <p>Live campus snapshot updated automatically at {nowLabel}.</p>
          {usingFallbackData || courseError ? (
            <small className="admin-muted-copy">
              {usingFallbackData ? `Directory API: ${error}` : `Courses API: ${courseError}`}
            </small>
          ) : null}
        </div>
        <div className="admin-overview-metrics">
          <article className="admin-overview-metric-card">
            <span>Student Attendance</span>
            <strong>{studentAttendancePercent}%</strong>
            <small>
              Present {studentPresentCount} • Absent {studentAbsentCount}
            </small>
          </article>
          <article className="admin-overview-metric-card">
            <span>Staff Attendance</span>
            <strong>{staffAttendancePercent}%</strong>
            <small>
              Present {staffPresentCount} • Absent {staffAbsentCount}
            </small>
          </article>
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
              <p className="admin-muted-copy">Tracking classroom participation from live student records.</p>
            </div>
            <div className="admin-status-pill is-soft">Today {attendanceSeries.at(-1)}%</div>
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
                {attendanceSeries.map((value, index) => (
                  <span
                    key={`${index}-${value}`}
                    style={{
                      left: `${(index / Math.max(attendanceSeries.length - 1, 1)) * 96 + 2}%`,
                      bottom: `${(value / 100) * 80 + 10}%`,
                    }}
                  />
                ))}
              </div>

              <div className="admin-tooltip" style={{ left: "62%", bottom: "56%" }}>
                <small>{nowLabel}</small>
                <strong>{attendanceSeries[Math.min(11, attendanceSeries.length - 1)]}%</strong>
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
              <p className="admin-muted-copy">Derived from live course, staff, and student totals.</p>
            </div>
            <span className="admin-status-pill is-soft">{dashboardStatus}</span>
          </div>

          <div className="admin-productivity-chart">
            <div className="admin-productivity-bars">
              {productivityData.map((item) => (
                <div key={item.month} className="admin-productivity-bar-group">
                  <div
                    className={[
                      "admin-productivity-bar",
                      item.tone === "strong" ? "is-strong" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ height: `${item.value * 4}px` }}
                  >
                    {item.tone === "strong" ? (
                      <div className="admin-productivity-tooltip">
                        <small>Live Load</small>
                        <strong>{item.value}</strong>
                      </div>
                    ) : null}
                  </div>
                  <span>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="admin-dual-grid">
        <DashboardTable
          searchTerm={searchTerm}
          students={students}
          staffMembers={staffMembers}
          courses={courses}
        />

        <article className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Recent Activity</h3>
              <p className="admin-muted-copy">Live operational updates built from synced records.</p>
            </div>
          </div>

          <div className="admin-activity-list">
            {recentActivity
              .filter((item) => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                return `${item.title} ${item.detail}`.toLowerCase().includes(term);
              })
              .map((item) => (
                <article key={item.id} className="admin-activity-item">
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
