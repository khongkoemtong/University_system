import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { baseStudents, classCatalog } from "./staffData";

export default function StaffClassAttendancePage() {
  const { currentTime } = useOutletContext();
  const { classSlug } = useParams();

  const classInfo = useMemo(
    () => classCatalog.find((item) => item.slug === classSlug),
    [classSlug],
  );

  const classStudents = useMemo(() => {
    if (!classInfo) return [];
    return baseStudents.filter((student) => student.className === classInfo.name);
  }, [classInfo]);

  const [attendanceMap, setAttendanceMap] = useState(() =>
    Object.fromEntries(classStudents.map((student) => [student.id, student.status])),
  );

  useEffect(() => {
    setAttendanceMap(Object.fromEntries(classStudents.map((student) => [student.id, student.status])));
  }, [classStudents]);

  if (!classInfo) {
    return <Navigate to="/staff/manage-attendance" replace />;
  }

  const updatedAt = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const presentCount = classStudents.filter(
    (student) => (attendanceMap[student.id] ?? student.status) === "Present",
  ).length;
  const lateCount = classStudents.filter(
    (student) => (attendanceMap[student.id] ?? student.status) === "Late",
  ).length;
  const absentCount = classStudents.filter(
    (student) => (attendanceMap[student.id] ?? student.status) === "Absent",
  ).length;

  return (
    <section className="staff-page">

      <section className="staff-class-overview">
        <article className="staff-stat-card">
          <p>Total Students</p>
          <strong>{classStudents.length}</strong>
        </article>
        <article className="staff-stat-card">
          <p>Class Type</p>
          <strong>{classInfo.type}</strong>
        </article>
        <article className="staff-stat-card">
          <p>Term & Time</p>
          <strong>{classInfo.schedule}</strong>
        </article>
        <article className="staff-stat-card">
          <p>Room</p>
          <strong>{classInfo.room}</strong>
        </article>
      </section>

      <section className="staff-content-panel">
        <div className="staff-content-panel-head staff-class-panel-head">

          <div className="staff-class-meta-row">
            <span>Created Date: {classInfo.createdAt}</span>
            <span>Instructor: {classInfo.instructor}</span>
            <span>
              Summary: {presentCount} present, {lateCount} late, {absentCount} absent
            </span>
          </div>


          <div className="staff-class-actions">
            <button type="button" className="staff-action-btn is-muted">
              Refresh Table
            </button>
            <button type="button" className="staff-action-btn is-blue">
              Group
            </button>
            <button type="button" className="staff-action-btn is-green">
              Save Attendance
            </button>
          </div>




        </div>



        <div className="staff-attendance-table-wrap">
          <table className="staff-attendance-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Student</th>
                <th>Gender</th>
                <th>Tel</th>
                <th>Attendance</th>
                <th>Attendance Score</th>
                <th>Activity Score</th>
                <th>Exam Score</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, index) => {
                const currentStatus = attendanceMap[student.id] ?? student.status;

                return (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="staff-table-student">
                        <strong>{student.name}</strong>
                        <span>ID: {student.id}</span>
                      </div>
                    </td>
                    <td>{student.gender}</td>
                    <td>{student.tel}</td>
                    <td>
                      <div className="staff-attendance-cell">
                        <span className={`staff-status ${currentStatus.toLowerCase()}`}>{currentStatus}</span>
                        <select
                          value={currentStatus}
                          onChange={(event) =>
                            setAttendanceMap((current) => ({
                              ...current,
                              [student.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </div>
                    </td>
                    <td>{student.attendanceScore}</td>
                    <td>{student.activityScore}</td>
                    <td>{student.examScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
