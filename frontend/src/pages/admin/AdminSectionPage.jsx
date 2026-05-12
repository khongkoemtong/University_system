import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { adminNavItems, scheduleItems, staffMembers, staffReports, students, teachers } from "./adminData";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function getAttendanceStatus(attendance) {
  if (attendance >= 95) {
    return { label: "Present", tone: "present" };
  }

  if (attendance >= 90) {
    return { label: "Late Risk", tone: "late" };
  }

  return { label: "Absent Risk", tone: "absent" };
}

const pageContent = {
  Report: {
    description: "Academic reporting, summaries, and unresolved follow-up items.",
    metrics: [
      { label: "Reports", value: 18 },
      { label: "Pending", value: 5 },
      { label: "Resolved", value: 42 },
    ],
  },
  Staff: {
    description: "Staff management is available from the dedicated staff page.",
    metrics: [
      { label: "Teams", value: 4 },
      { label: "Members", value: 8 },
      { label: "Open", value: 0 },
    ],
  },
  Database: {
    description: "Academic records, system syncs, and data freshness.",
    metrics: [
      { label: "Tables", value: 27 },
      { label: "Backups", value: 3 },
      { label: "Alerts", value: 1 },
    ],
  },
  Attendance: {
    description: "Classroom attendance quality and late-arrival follow-ups.",
    metrics: [
      { label: "Present", value: "94%" },
      { label: "Late", value: 12 },
      { label: "Absent", value: 7 },
    ],
  },
  Settings: {
    description: "Configuration, permission review, and environment health.",
    metrics: [
      { label: "Roles", value: 8 },
      { label: "Policies", value: 16 },
      { label: "Pending", value: 2 },
    ],
  },
};

export default function AdminSectionPage() {
  const { pageTitle, currentTime, searchTerm, theme, setTheme } = useOutletContext();
  const [reportView, setReportView] = useState("list");
  const [databaseView, setDatabaseView] = useState("students");
  const [databaseLayout, setDatabaseLayout] = useState("list");
  const [databaseSearch, setDatabaseSearch] = useState("");
  const [attendanceView, setAttendanceView] = useState("list");
  const [notificationMode, setNotificationMode] = useState("balanced");
  const {
    students: apiStudents,
    staffMembers: apiStaffMembers,
    loading: directoryLoading,
    error: directoryError,
    usingFallbackData,
  } = useAdminDirectoryData();
  const section = pageContent[pageTitle] ?? pageContent.Staff;
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedDatabaseSearch = databaseSearch.trim().toLowerCase();
  const studentRecords = usingFallbackData ? students : apiStudents;
  const staffRecords = usingFallbackData ? staffMembers : apiStaffMembers;

  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staffReports;
    return staffReports.filter((item) =>
      [item.staffName, item.position, item.title, item.detail, item.status]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [searchTerm]);

  const spotlight = useMemo(() => {
    const source = {
      Report: studentRecords,
      Staff: scheduleItems,
      Database: teachers,
      Attendance: studentRecords,
      Settings: staffRecords,
    }[pageTitle];

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return source.slice(0, 3);
    }

    return source.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(term),
    );
  }, [pageTitle, searchTerm, studentRecords, staffRecords]);

  const filteredStudents = useMemo(() => {
    if (!normalizedSearch) return studentRecords;
    return studentRecords.filter((student) =>
      [student.name, student.id, student.displayId, student.className, student.email, student.performance].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [normalizedSearch, studentRecords]);

  const databaseSearchResults = useMemo(() => {
    if (!normalizedDatabaseSearch) return studentRecords;
    return studentRecords.filter((student) =>
      [student.name, student.id, student.displayId, student.className, student.email, student.performance].some(
        (value) => value.toLowerCase().includes(normalizedDatabaseSearch),
      ),
    );
  }, [normalizedDatabaseSearch, studentRecords]);

  const filteredStaff = useMemo(() => {
    if (!normalizedSearch) return staffRecords;
    return staffRecords.filter((member) =>
      [member.name, member.id, member.displayId, member.role, member.email, member.office, member.status].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [normalizedSearch, staffRecords]);

  const filteredPositions = useMemo(() => {
    const positions = staffRecords.reduce((accumulator, member) => {
      if (!accumulator[member.roleSlug]) {
        accumulator[member.roleSlug] = {
          slug: member.roleSlug,
          name: member.role,
          type: member.office,
          people: [],
        };
      }

      accumulator[member.roleSlug].people.push(member);
      return accumulator;
    }, {});

    const values = Object.values(positions);

    if (!normalizedSearch) return values;
    return values.filter((position) =>
      [position.name, position.type, ...position.people.map((member) => member.name)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [normalizedSearch, staffRecords]);

  const attendanceStudents = useMemo(() => {
    if (!normalizedSearch) return studentRecords;
    return studentRecords.filter((student) =>
      [student.name, student.id, student.displayId, student.className, student.email, student.performance]
        .some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [normalizedSearch, studentRecords]);

  const attendanceOverview = useMemo(() => {
    if (!studentRecords.length) {
      return { average: 0, present: 0, late: 0, absent: 0 };
    }

    const average = Math.round(
      studentRecords.reduce((total, student) => total + student.attendance, 0) / studentRecords.length,
    );
    const present = studentRecords.filter((student) => student.attendance >= 95).length;
    const late = studentRecords.filter((student) => student.attendance >= 90 && student.attendance < 95).length;
    const absent = studentRecords.filter((student) => student.attendance < 90).length;

    return { average, present, late, absent };
  }, [studentRecords]);

  const classAttendanceSummary = useMemo(
    () =>
      Object.values(
        studentRecords.reduce((accumulator, student) => {
          if (!accumulator[student.className]) {
            accumulator[student.className] = {
              className: student.className,
              totalStudents: 0,
              totalAttendance: 0,
              atRisk: 0,
            };
          }

          accumulator[student.className].totalStudents += 1;
          accumulator[student.className].totalAttendance += student.attendance;
          if (student.attendance < 90) {
            accumulator[student.className].atRisk += 1;
          }

          return accumulator;
        }, {}),
      ).map((item) => ({
        ...item,
        averageAttendance: Math.round(item.totalAttendance / item.totalStudents),
      })),
    [studentRecords],
  );

  const followUpStudents = useMemo(
    () =>
      studentRecords
        .filter((student) => student.attendance < 95)
        .sort((left, right) => left.attendance - right.attendance),
    [studentRecords],
  );

  if (pageTitle === "Report") {
    return (
      <section className="admin-overview">
        <div className="admin-overview-head">
          <div>
           
            <p>Reports submitted by staff members, updated at {formattedTime}.</p>
          </div>
          <div className="admin-status-pill">{filteredReports.length} reports</div>
        </div>

        <div className="admin-section-metrics">
          {section.metrics.map((metric) => (
            <article key={metric.label} className="admin-panel admin-section-metric">
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Staff Reports</h3>
              <p className="admin-muted-copy">
                {searchTerm ? `Filtered by "${searchTerm}"` : "Showing all submitted staff reports."}
              </p>
            </div>
            <div className="admin-view-switcher">
              {["list", "card", "grid"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={reportView === mode ? "is-active" : ""}
                  onClick={() => setReportView(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className={`admin-report-grid is-${reportView}`}>
            {filteredReports.length ? (
              filteredReports.map((report, index) => (
                <Link key={report.id} to={`/admin/report/${report.id}`} className="admin-report-card">
                  <div className="admin-report-head">
                    <div className="admin-student-cell">
                      <span className={`avatar-tone-${(index % 3) + 1}`}>
                        {report.staffName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div>
                        <strong>{report.staffName}</strong>
                        <p>{report.position}</p>
                      </div>
                    </div>
                    <span className="admin-status-pill is-soft">{report.status}</span>
                  </div>

                  <div className="admin-report-body">
                    <strong>{report.title}</strong>
                    <p>{report.detail}</p>
                  </div>

                  <div className="admin-report-meta">
                    <span>{report.id}</span>
                    <span>{report.time}</span>
                  </div>
                </Link>
              ))
            ) : (
              <article className="admin-activity-item">
                <strong>No reports found</strong>
                <p>Try another staff name, position, or report keyword from the top search bar.</p>
              </article>
            )}
          </div>
        </article>
      </section>
    );
  }

  if (pageTitle === "Database") {
    return (
      <section className="admin-overview">
        <div className="admin-overview-head">
          <div>
           
            <p>Search students directly from this page or browse students, staff, and positions. Updated at {formattedTime}.</p>
          </div>
          <div className="admin-status-pill">
            {directoryLoading ? "Loading..." : usingFallbackData ? "Sample data" : "Live data"}
          </div>
        </div>

        {directoryError ? (
          <article className="admin-activity-item">
            <strong>Backend data is unavailable</strong>
            <p>Showing sample data for now. API message: {directoryError}</p>
          </article>
        ) : null}

        <div className="admin-page-search">
          <label className="admin-search admin-search-page">
            <span>⌕</span>
            <input
              type="text"
              value={databaseSearch}
              onChange={(event) => setDatabaseSearch(event.target.value)}
              placeholder="Search student by name, ID, class, or email..."
            />
          </label>
          {databaseSearch ? (
            <button
              type="button"
              className="admin-clear-search-btn"
              onClick={() => setDatabaseSearch("")}
            >
              Clear
            </button>
          ) : null}
        </div>

        {databaseSearch ? (
          <article className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h3>Student Search Results</h3>
                <p className="admin-muted-copy">
                  {databaseSearchResults.length} students found for "{databaseSearch}".
                </p>
              </div>
              <div className="admin-panel-actions">
                <div className="admin-view-switcher">
                  {["list", "card", "grid"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={databaseLayout === mode ? "is-active" : ""}
                      onClick={() => setDatabaseLayout(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`admin-database-records is-${databaseLayout}`}>
              {databaseSearchResults.length ? (
                databaseSearchResults.map((student, index) => (
                  <Link
                    key={student.id}
                    to={`/admin/database/student/${student.id}`}
                    className="admin-database-record-card"
                  >
                    <div className="admin-database-record-head">
                      <div className="admin-student-cell">
                        <span className={`avatar-tone-${(index % 3) + 1}`}>{initials(student.name)}</span>
                        <div>
                          <strong>{student.name}</strong>
                          <p>{student.displayId ?? student.id}</p>
                        </div>
                      </div>
                      <span className="admin-status-pill is-soft">{student.performance}</span>
                    </div>

                    <div className="admin-database-record-meta">
                      <span>{student.className}</span>
                      <span>{student.attendance}% attendance</span>
                      <span>{student.gender}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <article className="admin-activity-item">
                  <strong>No students found</strong>
                  <p>Try another student name, ID, class, or email.</p>
                </article>
              )}
            </div>
          </article>
        ) : (
          <>
            <div className="admin-stats admin-dashboard-filter-stats">
              <button
                type="button"
                className={`admin-stat-card admin-filter-card${databaseView === "students" ? " is-active" : ""}`}
                onClick={() => setDatabaseView("students")}
              >
                <div>
                  <p>Total Students</p>
                  <strong>{studentRecords.length}</strong>
                  <small>{filteredStudents.length} shown</small>
                </div>
              </button>

              <button
                type="button"
                className={`admin-stat-card admin-filter-card${databaseView === "staff" ? " is-active" : ""}`}
                onClick={() => setDatabaseView("staff")}
              >
                <div>
                  <p>Total Staff</p>
                  <strong>{staffRecords.length}</strong>
                  <small>{filteredStaff.length} shown</small>
                </div>
              </button>

              <button
                type="button"
                className={`admin-stat-card admin-filter-card${databaseView === "positions" ? " is-active" : ""}`}
                onClick={() => setDatabaseView("positions")}
              >
                <div>
                  <p>Total Position</p>
                  <strong>{filteredPositions.length}</strong>
                  <small>{filteredPositions.length} shown</small>
                </div>
              </button>
            </div>

            {databaseView === "students" ? (
          <article className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h3>All Students</h3>
                <p className="admin-muted-copy">
                  {searchTerm ? `Filtered by "${searchTerm}"` : "All students list."}
                </p>
              </div>
              <div className="admin-panel-actions">
                <div className="admin-view-switcher">
                  {["list", "card", "grid"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={databaseLayout === mode ? "is-active" : ""}
                      onClick={() => setDatabaseLayout(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <Link to="/admin/students" className="admin-inline-link">
                  Open student page
                </Link>
              </div>
            </div>

            <div className={`admin-database-records is-${databaseLayout}`}>
              {filteredStudents.map((student, index) => (
                <Link
                  key={student.id}
                  to={`/admin/database/student/${student.id}`}
                  className="admin-database-record-card"
                >
                  <div className="admin-database-record-head">
                    <div className="admin-student-cell">
                      <span className={`avatar-tone-${(index % 3) + 1}`}>{initials(student.name)}</span>
                      <div>
                        <strong>{student.name}</strong>
                        <p>{student.displayId ?? student.id}</p>
                      </div>
                    </div>
                    <span className="admin-status-pill is-soft">{student.performance}</span>
                  </div>

                  <div className="admin-database-record-meta">
                    <span>{student.className}</span>
                    <span>{student.attendance}% attendance</span>
                    <span>{student.gender}</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
            ) : null}

            {databaseView === "staff" ? (
          <article className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h3>All Staff</h3>
                <p className="admin-muted-copy">
                  {searchTerm ? `Filtered by "${searchTerm}"` : "All staff list."}
                </p>
              </div>
              <div className="admin-panel-actions">
                <div className="admin-view-switcher">
                  {["list", "card", "grid"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={databaseLayout === mode ? "is-active" : ""}
                      onClick={() => setDatabaseLayout(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <Link to="/admin/staff" className="admin-inline-link">
                  Open staff page
                </Link>
              </div>
            </div>

            <div className={`admin-database-records is-${databaseLayout}`}>
              {filteredStaff.map((member, index) => (
                <Link
                  key={member.id}
                  to={`/admin/database/staff/${member.id}`}
                  className="admin-database-record-card"
                >
                  <div className="admin-database-record-head">
                    <div className="admin-student-cell">
                      <span className={`avatar-tone-${(index % 3) + 1}`}>{initials(member.name)}</span>
                      <div>
                        <strong>{member.name}</strong>
                        <p>{member.displayId ?? member.id}</p>
                      </div>
                    </div>
                    <span className="admin-status-pill is-soft">{member.status}</span>
                  </div>

                  <div className="admin-database-record-meta">
                    <span>{member.role}</span>
                    <span>{member.office}</span>
                    <span>{member.shift}</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
            ) : null}

            {databaseView === "positions" ? (
          <article className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h3>All Positions</h3>
                <p className="admin-muted-copy">
                  {searchTerm ? `Filtered by "${searchTerm}"` : "All staff positions list."}
                </p>
              </div>
              <div className="admin-panel-actions">
                <div className="admin-view-switcher">
                  {["list", "card", "grid"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={databaseLayout === mode ? "is-active" : ""}
                      onClick={() => setDatabaseLayout(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <Link to="/admin/staff" className="admin-inline-link">
                  Open staff page
                </Link>
              </div>
            </div>

            <div className={`admin-staff-position-grid is-${databaseLayout}`}>
              {filteredPositions.map((position) => (
                <Link
                  key={position.slug}
                  to={`/admin/staff/${position.slug}`}
                  className="admin-staff-position-card"
                >
                  <div>
                    <span className="admin-staff-type-pill">{position.type}</span>
                    <strong>{position.name}</strong>
                    <p>{position.people.length} staff members</p>
                  </div>
                  <div className="admin-staff-position-meta">
                    <span>People {position.people.length}</span>
                    <span className="admin-staff-view-link">View</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
            ) : null}
          </>
        )}
      </section>
    );
  }

  if (pageTitle === "Attendance") {
    return (
      <section className="admin-overview">
        <div className="admin-overview-head">
          <div>
          
            <p>Clear attendance monitoring for students, classes, and follow-up actions. Updated at {formattedTime}.</p>
          </div>
          <div className="admin-status-pill">
            {directoryLoading ? "Loading..." : usingFallbackData ? "Sample data" : "Live review"}
          </div>
        </div>

        {directoryError ? (
          <article className="admin-activity-item">
            <strong>Attendance is using sample data</strong>
            <p>The current backend student API does not include full attendance fields yet, so a matched fallback is shown.</p>
          </article>
        ) : null}

        <div className="admin-attendance-summary-grid">
          <article className="admin-attendance-summary-card is-primary">
            <span>Overall Attendance</span>
            <strong>{attendanceOverview.average}%</strong>
            <small>Campus average today</small>
          </article>
          <article className="admin-attendance-summary-card">
            <span>Present</span>
            <strong>{attendanceOverview.present}</strong>
            <small>Students above 95%</small>
          </article>
          <article className="admin-attendance-summary-card">
            <span>Late Risk</span>
            <strong>{attendanceOverview.late}</strong>
            <small>Students between 90% and 94%</small>
          </article>
          <article className="admin-attendance-summary-card is-alert">
            <span>Absent Risk</span>
            <strong>{attendanceOverview.absent}</strong>
            <small>Students below 90%</small>
          </article>
        </div>

        <div className="admin-attendance-workspace">
          <article className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h3>Classroom Health</h3>
                <p className="admin-muted-copy">See which classes are healthy and which need attention.</p>
              </div>
            </div>

            <div className="admin-attendance-class-grid">
              {classAttendanceSummary.map((classroom) => (
                <article key={classroom.className} className="admin-attendance-class-card">
                  <div className="admin-attendance-class-head">
                    <div>
                      <strong>{classroom.className}</strong>
                      <p>{classroom.totalStudents} students</p>
                    </div>
                    <span className="admin-status-pill is-soft">{classroom.averageAttendance}%</span>
                  </div>
                  <div className="admin-attendance-progress">
                    <span style={{ width: `${classroom.averageAttendance}%` }} />
                  </div>
                  <div className="admin-attendance-class-meta">
                    <span>Average attendance</span>
                    <span>{classroom.atRisk} need follow-up</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h3>Needs Attention</h3>
                <p className="admin-muted-copy">Fast follow-up list for at-risk attendance.</p>
              </div>
            </div>

            <div className="admin-attendance-followup-list">
              {followUpStudents.map((student, index) => {
                const status = getAttendanceStatus(student.attendance);
                return (
                  <Link
                    key={student.id}
                    to={`/admin/database/student/${student.id}`}
                    className="admin-attendance-followup-card"
                  >
                    <div className="admin-student-cell">
                      <span className={`avatar-tone-${(index % 3) + 1}`}>{initials(student.name)}</span>
                      <div>
                        <strong>{student.name}</strong>
                        <p>{student.className}</p>
                      </div>
                    </div>
                    <div className="admin-attendance-followup-meta">
                      <strong>{student.attendance}%</strong>
                      <span className={`admin-attendance-tone is-${status.tone}`}>{status.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </article>
        </div>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Student Attendance Roster</h3>
              <p className="admin-muted-copy">
                {searchTerm ? `Filtered by "${searchTerm}"` : "Search students, classes, or email from the top bar."}
              </p>
            </div>
            <div className="admin-panel-actions">
              <div className="admin-view-switcher">
                {["list", "card", "grid"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={attendanceView === mode ? "is-active" : ""}
                    onClick={() => setAttendanceView(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`admin-attendance-roster is-${attendanceView}`}>
            {attendanceStudents.map((student, index) => {
              const status = getAttendanceStatus(student.attendance);
              return (
                <Link
                  key={student.id}
                  to={`/admin/database/student/${student.id}`}
                  className="admin-attendance-roster-card"
                >
                  <div className="admin-attendance-roster-head">
                    <div className="admin-student-cell">
                      <span className={`avatar-tone-${(index % 3) + 1}`}>{initials(student.name)}</span>
                      <div>
                        <strong>{student.name}</strong>
                        <p>{student.displayId ?? student.id}</p>
                      </div>
                    </div>
                    <span className={`admin-attendance-tone is-${status.tone}`}>{status.label}</span>
                  </div>

                  <div className="admin-attendance-roster-meta">
                    <span>{student.className}</span>
                    <span>{student.attendance}% attendance</span>
                    <span>{student.performance}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </article>
      </section>
    );
  }

  if (pageTitle === "Settings") {
    return (
      <section className="admin-overview">
        <div className="admin-overview-head">
          <div>
           
            <p>Make the admin panel easier and more comfortable for every person who uses it.</p>
          </div>
          <div className="admin-status-pill">Updated at {formattedTime}</div>
        </div>

        <div className="admin-settings-hero">
          <div>
            <span className="admin-settings-kicker">Workspace Experience</span>
            <h3>Choose the theme and tune the control room for daily admin work.</h3>
            <p>
              Switch between light and dark mode, review notification behavior, and keep the
              dashboard comfortable during long sessions.
            </p>
          </div>
          <div className="admin-settings-preview">
            <button
              type="button"
              className={`admin-theme-preview${theme === "light" ? " is-active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <span className="admin-theme-preview-window is-light" />
              <strong>Light</strong>
              <small>Bright, clean, and simple</small>
            </button>
            <button
              type="button"
              className={`admin-theme-preview${theme === "dark" ? " is-active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <span className="admin-theme-preview-window is-dark" />
              <strong>Dark</strong>
              <small>Calm for late working hours</small>
            </button>
          </div>
        </div>

        <div className="admin-settings-grid">
          <article className="admin-panel admin-settings-panel">
            <div className="admin-panel-head">
              <div>
                <h3>Theme Mode</h3>
                <p className="admin-muted-copy">Apply the appearance that feels best for your team.</p>
              </div>
            </div>

            <div className="admin-settings-option-list">
              {["light", "dark"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`admin-settings-option${theme === mode ? " is-active" : ""}`}
                  onClick={() => setTheme(mode)}
                >
                  <div>
                    <strong>{mode === "light" ? "Light Theme" : "Dark Theme"}</strong>
                    <p>
                      {mode === "light"
                        ? "Best for bright rooms and everyday office work."
                        : "Best for focus and lower-light environments."}
                    </p>
                  </div>
                  <span>{theme === mode ? "Active" : "Select"}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="admin-panel admin-settings-panel">
            <div className="admin-panel-head">
              <div>
                <h3>Notification Style</h3>
                <p className="admin-muted-copy">Pick how much attention the system should ask from you.</p>
              </div>
            </div>

            <div className="admin-settings-option-list">
              {[
                { id: "quiet", label: "Quiet", copy: "Only important alerts and urgent issues." },
                { id: "balanced", label: "Balanced", copy: "Recommended mix for daily work." },
                { id: "live", label: "Live", copy: "Show more real-time updates and reminders." },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`admin-settings-option${notificationMode === option.id ? " is-active" : ""}`}
                  onClick={() => setNotificationMode(option.id)}
                >
                  <div>
                    <strong>{option.label}</strong>
                    <p>{option.copy}</p>
                  </div>
                  <span>{notificationMode === option.id ? "Active" : "Select"}</span>
                </button>
              ))}
            </div>
          </article>
        </div>

        <div className="admin-settings-insights">
          <article className="admin-settings-insight-card">
            <span>Current Theme</span>
            <strong>{theme === "light" ? "Light Mode" : "Dark Mode"}</strong>
            <p>The theme is saved for the next time you open the admin panel.</p>
          </article>
          <article className="admin-settings-insight-card">
            <span>Notification Style</span>
            <strong>{notificationMode.charAt(0).toUpperCase() + notificationMode.slice(1)}</strong>
            <p>Use balanced mode if multiple admins share the same dashboard workflow.</p>
          </article>
          <article className="admin-settings-insight-card">
            <span>User Comfort</span>
            <strong>Optimized</strong>
            <p>The layout stays readable on both desktop and mobile screens.</p>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <h2>{pageTitle}</h2>
          <p>{section.description}</p>
        </div>
        <div className="admin-status-pill">Updated at {formattedTime}</div>
      </div>

      <div className="admin-section-metrics">
        {section.metrics.map((metric) => (
          <article key={metric.label} className="admin-panel admin-section-metric">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-dual-grid">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>{pageTitle} Overview</h3>
              <p className="admin-muted-copy">
                This section is route-based now, so the sidebar actually navigates.
              </p>
            </div>
          </div>
          <div className="admin-detail-stack">
            {adminNavItems.slice(0, 4).map((item, index) => (
              <div key={item.label} className="admin-detail-row">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>
                    Operational workflow for {item.label.toLowerCase()} is available from this
                    admin panel.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Spotlight Results</h3>
              <p className="admin-muted-copy">
                {searchTerm ? `Filtered by "${searchTerm}"` : "Showing current highlights."}
              </p>
            </div>
          </div>
          <div className="admin-activity-list">
            {spotlight.length ? (
              spotlight.slice(0, 4).map((item, index) => (
                <article key={index} className="admin-activity-item">
                  <strong>{Object.values(item)[0]}</strong>
                  <p>{Object.values(item).slice(1).join(" • ")}</p>
                </article>
              ))
            ) : (
              <article className="admin-activity-item">
                <strong>No results found</strong>
                <p>Try another search term from the top bar.</p>
              </article>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
