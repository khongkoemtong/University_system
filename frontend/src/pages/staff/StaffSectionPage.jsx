import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { baseStudents, classCatalog } from "./staffData";

export default function StaffSectionPage() {
  const { pageTitle, filteredStudents, currentTime } = useOutletContext();
  const time = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const classList = useMemo(() => classCatalog, []);
  const [classView, setClassView] = useState("grid");
  const maleStudents = useMemo(
    () => baseStudents.filter((student) => student.gender === "Male").length,
    [],
  );
  const femaleStudents = useMemo(
    () => baseStudents.filter((student) => student.gender === "Female").length,
    [],
  );

  if (pageTitle === "Manage Attendance") {
    return (
      <section className="staff-page">
        <div className="staff-page-head">
          <div>
           
            <p>Class attendance workspace updated at {time}.</p>
          </div>
          
        </div>

        <section className="staff-manage-summary">
          <article className="staff-manage-summary-card">
            <div>
              <p>Total Class</p>
              <strong>{classList.length}</strong>
            </div>
            <span className="staff-manage-summary-icon is-class">▣</span>
          </article>
          <article className="staff-manage-summary-card">
            <div>
              <p>Total Student</p>
              <strong>{baseStudents.length}</strong>
            </div>
            <span className="staff-manage-summary-icon is-student">●●</span>
          </article>
          <article className="staff-manage-summary-card">
            <div>
              <p>Male Student</p>
              <strong>{maleStudents}</strong>
            </div>
            <span className="staff-manage-summary-icon is-male">♂</span>
          </article>
          <article className="staff-manage-summary-card">
            <div>
              <p>Female Student</p>
              <strong>{femaleStudents}</strong>
            </div>
            <span className="staff-manage-summary-icon is-female">♀</span>
          </article>
        </section>

        <section className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>All Classes</h3>
              <p>Click a class to open its attendance page.</p>
            </div>
            <div className="staff-view-switcher">
              {["grid", "list", "card"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`staff-view-switcher-btn${classView === mode ? " is-active" : ""}`}
                  onClick={() => setClassView(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className={`staff-class-grid is-${classView}`}>
            {classList.map((className) => {
              const studentCount = baseStudents.filter(
                (student) => student.className === className.name,
              ).length;

              return (
                <Link
                  key={className.slug}
                  to={`/staff/manage-attendance/${className.slug}`}
                  className="staff-class-item"
                >
                  <div>
                    <span className="staff-class-label">{className.type}</span>
                    <strong>{className.name}</strong>
                    <p>{className.schedule}</p>
                  </div>
                  <div className="staff-class-item-meta">
                    <span>{className.room}</span>
                    <span>{studentCount} students</span>
                    <span className="staff-class-arrow">View</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="staff-page">
      <div className="staff-page-head">
        <div>
          <h2>{pageTitle}</h2>
          <p>Route-based teacher page updated at {time}.</p>
        </div>
        <div className="staff-status-pill">
          <span className="staff-live-dot" />
          {filteredStudents.length} matched students
        </div>
      </div>

      <section className="staff-content-panel">
        <div className="staff-content-panel-head">
          <div>
            <h3>{pageTitle}</h3>
            <p>
              {pageTitle === "Manage Attendance"
                ? "Mark present, absent, or late for your filtered students."
                : pageTitle === "Student's List"
                  ? "Searchable attendance list for assigned students."
                  : "Attendance summaries for reporting and review."}
            </p>
          </div>
        </div>

        <div className="staff-student-table">
          {filteredStudents.map((student) => (
            <article key={student.name} className="staff-student-row">
              <div className="staff-student-left">
                <div className="staff-mini-avatar">
                  {student.name.split(" ").map((part) => part[0]).join("")}
                </div>
                <div>
                  <strong>{student.name}</strong>
                  <p className="staff-student-meta">
                    {student.className} • {student.gender} • {student.percent}%
                  </p>
                </div>
              </div>
              <span className={`staff-status ${student.status.toLowerCase()}`}>{student.status}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
