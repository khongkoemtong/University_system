import { useMemo } from "react";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

function toClassSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function AdminStudentClassPage() {
  const { currentTime, searchTerm } = useOutletContext();
  const { classSlug } = useParams();
  const { students, loading } = useAdminDirectoryData();

  const className = useMemo(() => {
    const match = students.find((student) => toClassSlug(student.className) === classSlug);
    return match?.className ?? null;
  }, [classSlug, students]);

  const classStudents = useMemo(() => {
    if (!className) return [];
    return students.filter((student) => student.className === className);
  }, [className, students]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return classStudents;
    return classStudents.filter((student) =>
      [
        student.name,
        student.id,
        student.displayId,
        student.className,
        student.gender,
        student.email,
        student.performance,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [classStudents, searchTerm]);

  if (!className) {
    if (loading) {
      return (
        <section className="admin-overview">
          <article className="admin-panel">
            <p>Loading class data...</p>
          </article>
        </section>
      );
    }

    return <Navigate to="/admin/students" replace />;
  }

  const maleCount = classStudents.filter((student) => student.gender === "Male").length;
  const femaleCount = classStudents.filter((student) => student.gender === "Female").length;
  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <div className="admin-staff-breadcrumbs">
            <Link to="/admin/students">Students</Link>
            <span>/</span>
            <strong>{className}</strong>
          </div>
          <h2>{className}</h2>
          <p>Student details updated at {nowLabel}.</p>
        </div>
        <div className="admin-status-pill">{filteredStudents.length} students shown</div>
      </div>

      <div className="admin-staff-summary">
        <article className="admin-staff-summary-card">
          <p>Total Students</p>
          <strong>{classStudents.length}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Male Students</p>
          <strong>{maleCount}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Female Students</p>
          <strong>{femaleCount}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Search Result</p>
          <strong>{filteredStudents.length}</strong>
        </article>
      </div>

      <article className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3>{className} Student List</h3>
            <p className="admin-muted-copy">
              {searchTerm ? `Filtered by "${searchTerm}"` : "Use the top search bar to find students."}
            </p>
          </div>
        </div>

        <div className="admin-staff-people-grid">
          {filteredStudents.length ? (
            filteredStudents.map((student, index) => (
              <article key={student.id} className="admin-staff-person-card">
                <div className="admin-staff-person-head">
                  <div className="admin-student-cell">
                    <span className={`avatar-tone-${(index % 3) + 1}`}>
                      {student.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <strong>{student.name}</strong>
                      <p>{student.displayId}</p>
                    </div>
                  </div>
                  <span className="admin-status-pill is-soft">{student.performance}</span>
                </div>

                <div className="admin-staff-person-info">
                  <div>
                    <span>Class</span>
                    <strong>{student.className}</strong>
                  </div>
                  <div>
                    <span>Gender</span>
                    <strong>{student.gender}</strong>
                  </div>
                  <div>
                    <span>Age</span>
                    <strong>{student.age}</strong>
                  </div>
                  <div>
                    <span>Attendance</span>
                    <strong>{student.attendance}%</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{student.email}</strong>
                  </div>
                  <div>
                    <span>Performance</span>
                    <strong>{student.performance}</strong>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className="admin-activity-item">
              <strong>No students found</strong>
              <p>Try another name, email, class, or student ID in the top search bar.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  );
}
