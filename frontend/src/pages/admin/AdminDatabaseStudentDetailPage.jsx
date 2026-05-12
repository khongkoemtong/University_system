import { Navigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

function getStudentSummary(student) {
  return `Dedicated student from ${student.className} with strong ${student.performance.toLowerCase()} performance, ${student.attendance}% attendance, and a growing academic profile. Ready to continue learning, improve discipline, and contribute positively to the school community.`;
}

export default function AdminDatabaseStudentDetailPage() {
  const { currentTime } = useOutletContext();
  const { studentId } = useParams();
  const { students, loading } = useAdminDirectoryData();

  const student = students.find((item) => item.id === studentId);

  useEffect(() => {
    if (!student) {
      return undefined;
    }

    const previousTitle = document.title;
    document.title = `${student.name} Student Paper`;

    return () => {
      document.title = previousTitle;
    };
  }, [student]);

  if (!student) {
    if (loading) {
      return (
        <section className="admin-overview">
          <article className="admin-panel">
            <p>Loading student profile...</p>
          </article>
        </section>
      );
    }

    return <Navigate to="/admin/database" replace />;
  }

  const printDate = currentTime.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const studentInitials = student.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <section className="admin-overview">
      <div className="admin-overview-head no-print">
        <div>
          <h2>{student.name}</h2>
          <p>Important student information for quick review, with full detail available on print.</p>
        </div>
        <div className="admin-panel-actions">
          <button
            type="button"
            className="admin-report-action-btn is-print"
            onClick={() => window.print()}
          >
            <span aria-hidden="true">🖨</span> Print Student Paper
          </button>
        </div>
      </div>

      <article className="admin-panel admin-student-web-card no-print">
        <div className="admin-panel-head">
          <div>
            <h3>Student Information</h3>
            <p className="admin-muted-copy">Only the most important information is shown on the webpage.</p>
          </div>
        </div>

        <div className="admin-student-web-grid">
          <div className="admin-student-web-profile">
            <div className="admin-student-resume-photo">{studentInitials}</div>
            <div>
              <strong>{student.name}</strong>
              <p>{student.displayId}</p>
            </div>
          </div>

          <div className="admin-student-web-meta">
            <div>
              <span>Class</span>
              <strong>{student.className}</strong>
            </div>
            <div>
              <span>Attendance</span>
              <strong>{student.attendance}%</strong>
            </div>
            <div>
              <span>Performance</span>
              <strong>{student.performance}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{student.email}</strong>
            </div>
          </div>
        </div>
      </article>

      <article className="admin-student-resume print-only">
        <div className="admin-student-resume-left">
          <section className="admin-student-resume-block is-hero">
            <h1>{student.name.toUpperCase()}</h1>
            <h2>Student Profile</h2>
            <p>{getStudentSummary(student)}</p>
          </section>

          <section className="admin-student-resume-section">
            <div className="admin-student-resume-section-title">EDUCATION</div>
            <div className="admin-student-resume-block">
              <article className="admin-student-resume-entry">
                <strong>{student.className}</strong>
                <em>Current Academic Level</em>
                <span>School Administration | Current Year</span>
              </article>
              <article className="admin-student-resume-entry">
                <strong>General Education Program</strong>
                <em>Student Development Track</em>
                <span>Academic Growth | Ongoing</span>
              </article>
            </div>
          </section>

          <section className="admin-student-resume-section">
            <div className="admin-student-resume-section-title">ACADEMIC PROFILE</div>
            <div className="admin-student-resume-block">
              <article className="admin-student-resume-entry">
                <strong>Performance Level</strong>
                <em>{student.performance}</em>
                <ul>
                  <li>Maintains {student.attendance}% attendance in class activities.</li>
                  <li>Participates in classroom learning and school requirements.</li>
                  <li>Shows progress through regular attendance and academic consistency.</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="admin-student-resume-section">
            <div className="admin-student-resume-section-title">GOALS</div>
            <div className="admin-student-resume-block">
              <article className="admin-student-resume-entry">
                <strong>Student Development</strong>
                <em>Future Focus</em>
                <ul>
                  <li>Improve academic results through daily study discipline.</li>
                  <li>Build stronger communication and teamwork in school activities.</li>
                  <li>Maintain high attendance and positive classroom behavior.</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="admin-student-resume-section">
            <div className="admin-student-resume-section-title">ACHIEVEMENTS</div>
            <div className="admin-student-resume-block">
              <article className="admin-student-resume-entry">
                <strong>School Progress Highlights</strong>
                <em>Current Review</em>
                <ul>
                  <li>Maintains a {student.performance.toLowerCase()} academic standing.</li>
                  <li>Shows consistent classroom participation in {student.className}.</li>
                  <li>Builds a reliable attendance record for ongoing school activities.</li>
                </ul>
              </article>
            </div>
          </section>
        </div>

        <aside className="admin-student-resume-right">
          <div className="admin-student-resume-photo-card">
            <div className="admin-student-resume-photo">{studentInitials}</div>
          </div>

          <section className="admin-student-resume-side-section">
            <h3>CONTACT</h3>
            <ul>
              <li>{student.email}</li>
              <li>{student.className}</li>
              <li>Student ID: {student.id}</li>
              <li>Student Code: {student.displayId}</li>
              <li>Printed: {printDate}</li>
            </ul>
          </section>

          <section className="admin-student-resume-side-section">
            <h3>STUDENT INFO</h3>
            <ul>
              <li>Age: {student.age}</li>
              <li>Gender: {student.gender}</li>
              <li>Attendance: {student.attendance}%</li>
              <li>Performance: {student.performance}</li>
            </ul>
          </section>

          <section className="admin-student-resume-side-section">
            <h3>SKILLS</h3>
            <ul>
              <li>Communication</li>
              <li>Class Participation</li>
              <li>Responsibility</li>
              <li>Discipline</li>
              <li>Academic Growth</li>
            </ul>
          </section>

          <section className="admin-student-resume-side-section">
            <h3>INTERESTS</h3>
            <ul>
              <li>School Activities</li>
              <li>Reading</li>
              <li>Team Learning</li>
              <li>Personal Improvement</li>
            </ul>
          </section>

          <section className="admin-student-resume-side-section">
            <h3>LANGUAGES</h3>
            <ul>
              <li>Khmer</li>
              <li>English</li>
            </ul>
          </section>

          <section className="admin-student-resume-side-section">
            <h3>ACADEMIC STATUS</h3>
            <ul>
              <li>Class Level: {student.className}</li>
              <li>Attendance Rate: {student.attendance}%</li>
              <li>Profile Status: {student.performance}</li>
            </ul>
          </section>

          <section className="admin-student-resume-side-section">
            <h3>REFERENCE</h3>
            <p>Administration Office</p>
            <p>School Management Team</p>
          </section>
        </aside>
      </article>
    </section>
  );
}
