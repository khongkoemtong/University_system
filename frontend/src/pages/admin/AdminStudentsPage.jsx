import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

export default function AdminStudentsPage() {
  const { currentTime } = useOutletContext();
  const [viewMode, setViewMode] = useState("grid");
  const { students, loading, usingFallbackData } = useAdminDirectoryData();

  const maleCount = useMemo(
    () => students.filter((student) => student.gender === "Male").length,
    [students],
  );
  const femaleCount = useMemo(
    () => students.filter((student) => student.gender === "Female").length,
    [students],
  );
  const classSummary = useMemo(
    () =>
      Object.entries(
        students.reduce((accumulator, student) => {
          const currentClass = accumulator[student.className] || {
            name: student.className,
            count: 0,
            male: 0,
            female: 0,
          };

          currentClass.count += 1;
          if (student.gender === "Male") currentClass.male += 1;
          if (student.gender === "Female") currentClass.female += 1;

          accumulator[student.className] = currentClass;
          return accumulator;
        }, {}),
      )
        .map(([, value]) => ({
          ...value,
          slug: value.name.toLowerCase().replace(/\s+/g, "-"),
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [students],
  );
  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <h2>Students</h2>
          <p>Manage all student classes and members updated at {nowLabel}.</p>
        </div>
        <div className="admin-status-pill">
          {loading ? "Loading..." : usingFallbackData ? "Sample data" : "Live data"}
        </div>
      </div>

      <div className="admin-staff-summary">
        <article className="admin-staff-summary-card">
          <p>Total Students</p>
          <strong>{students.length}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Total Classes</p>
          <strong>{classSummary.length}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Male Students</p>
          <strong>{maleCount}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Female Students</p>
          <strong>{femaleCount}</strong>
        </article>
      </div>

      <article className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3>Students by Class</h3>
            <p className="admin-muted-copy">Click a class to open the full student details page.</p>
          </div>
          <div className="admin-view-switcher">
            {["grid", "list", "card"].map((mode) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "is-active" : ""}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className={`admin-staff-position-grid is-${viewMode}`}>
          {classSummary.map((classroom) => (
            <Link
              key={classroom.slug}
              to={`/admin/students/${classroom.slug}`}
              className="admin-staff-position-card"
            >
              <div>
                <span className="admin-staff-type-pill">Class Group</span>
                <strong>{classroom.name}</strong>
                <p>{classroom.count} students</p>
              </div>
              <div className="admin-staff-position-meta">
                <span>Male {classroom.male}</span>
                <span>Female {classroom.female}</span>
                <span className="admin-staff-view-link">View</span>
              </div>
            </Link>
          ))}
        </div>
      </article>
    </section>
  );
}
