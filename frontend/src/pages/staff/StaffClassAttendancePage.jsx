import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { fetchClassAttendance, saveClassAttendance } from "../admin/adminApi";

const attendanceOptions = [
  { value: "Present", shortLabel: "P", tone: "present" },
  { value: "Late", shortLabel: "L", tone: "late" },
  { value: "Absent", shortLabel: "A", tone: "absent" },
];

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitleCase(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized ? normalized.replace(/^\w/, (character) => character.toUpperCase()) : "Present";
}

export default function StaffClassAttendancePage() {
  const navigate = useNavigate();
  const { currentTime, classes, filteredStudents, sessionToken } = useOutletContext();
  const { classSlug } = useParams();

  const classInfo = useMemo(
    () => classes.find((item) => (item.slug || slugify(item.classCode || item.name)) === classSlug),
    [classSlug, classes],
  );

  const classStudents = useMemo(() => {
    if (!classInfo) return [];
    return filteredStudents.filter(
      (student) => student.classId === classInfo.id || student.className === classInfo.name,
    );
  }, [classInfo, filteredStudents]);

  const attendanceDate = useMemo(() => {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, "0");
    const day = String(currentTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [currentTime]);

  const [attendanceMap, setAttendanceMap] = useState(() =>
    Object.fromEntries(classStudents.map((student) => [student.id, "Present"])),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    tone: "success",
    title: "",
    message: "",
    shouldRedirect: false,
  });

  useEffect(() => {
    setAttendanceMap(Object.fromEntries(classStudents.map((student) => [student.id, "Present"])));
  }, [classStudents]);

  useEffect(() => {
    let isCancelled = false;

    async function loadSavedAttendance() {
      if (!classInfo || !sessionToken) {
        return;
      }

      try {
        const data = await fetchClassAttendance(
          {
            classId: classInfo.id,
            date: attendanceDate,
          },
          sessionToken,
        );

        if (isCancelled || !Array.isArray(data) || !data.length) {
          return;
        }

        const savedStatuses = Object.fromEntries(
          data.map((entry) => [String(entry.student_id), toTitleCase(entry.status)]),
        );

        setAttendanceMap((current) => ({
          ...current,
          ...savedStatuses,
        }));
      } catch (error) {
        if (!isCancelled) {
          setModalState({
            isOpen: true,
            tone: "error",
            title: "Attendance Load Failed",
            message: error instanceof Error ? error.message : "Unable to load saved attendance.",
            shouldRedirect: false,
          });
        }
      }
    }

    loadSavedAttendance();

    return () => {
      isCancelled = true;
    };
  }, [attendanceDate, classInfo, sessionToken]);

  if (!classInfo) {
    return <Navigate to="/staff/manage-attendance" replace />;
  }

  const presentCount = classStudents.filter(
    (student) => (attendanceMap[student.id] ?? "Present") === "Present",
  ).length;
  const lateCount = classStudents.filter(
    (student) => (attendanceMap[student.id] ?? "Present") === "Late",
  ).length;
  const absentCount = classStudents.filter(
    (student) => (attendanceMap[student.id] ?? "Present") === "Absent",
  ).length;

  async function handleSaveAttendance() {
    if (!sessionToken) {
      setModalState({
        isOpen: true,
        tone: "error",
        title: "Session Missing",
        message: "Your login session is missing. Please sign in again.",
        shouldRedirect: false,
      });
      return;
    }

    try {
      setIsSaving(true);

      await saveClassAttendance(
        {
          classId: classInfo.id,
          date: attendanceDate,
          entries: classStudents.map((student) => ({
            student_id: Number(student.id),
            status: String(attendanceMap[student.id] ?? "Present").toLowerCase(),
          })),
        },
        sessionToken,
      );

      setModalState({
        isOpen: true,
        tone: "success",
        title: "Attendance Saved",
        message: `Attendance saved for ${attendanceDate}.`,
        shouldRedirect: true,
      });
    } catch (error) {
      setModalState({
        isOpen: true,
        tone: "error",
        title: "Save Failed",
        message: error instanceof Error ? error.message : "Unable to save attendance right now.",
        shouldRedirect: false,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleModalClose() {
    const shouldRedirect = modalState.shouldRedirect;

    setModalState({
      isOpen: false,
      tone: "success",
      title: "",
      message: "",
      shouldRedirect: false,
    });

    if (shouldRedirect) {
      navigate("/staff/manage-attendance", { replace: true });
    }
  }

  return (
    <section className="staff-page">
      <section className="staff-class-overview">
        <article className="staff-stat-card">
          <p>Total Students</p>
          <strong>{classStudents.length}</strong>
        </article>
        <article className="staff-stat-card">
          <p>Class Code</p>
          <strong>{classInfo.classCode}</strong>
        </article>
        <article className="staff-stat-card">
          <p>Capacity</p>
          <strong>{classInfo.maxStudents}</strong>
        </article>
        <article className="staff-stat-card">
          <p>Open Seats</p>
          <strong>{classInfo.openSeats}</strong>
        </article>
      </section>

      <section className="staff-content-panel">
        <div className="staff-content-panel-head staff-class-panel-head">
          <div>
            <h3>{classInfo.name}</h3>
            <p>Attendance tracking for your assigned class.</p>
          </div>

          <div className="staff-class-meta-row">
            <span>Attendance Date: {attendanceDate}</span>
            <span>Created Date: {classInfo.createdAt || "Not available"}</span>
            <span>Instructor: {classInfo.teacherName || "Not assigned"}</span>
            <span>
              Summary: {presentCount} present, {lateCount} late, {absentCount} absent
            </span>
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
                const currentStatus = attendanceMap[student.id] ?? "Present";

                return (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="staff-table-student">
                        <strong>{student.name}</strong>
                        <span>ID: {student.displayId}</span>
                      </div>
                    </td>
                    <td>{student.gender}</td>
                    <td>{student.tel}</td>
                    <td>
                      <div className="staff-attendance-cell">
                        <span className={`staff-status ${String(currentStatus).toLowerCase()}`}>{currentStatus}</span>
                        <div className="staff-attendance-toggle" role="group" aria-label={`Attendance for ${student.name}`}>
                          {attendanceOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`staff-attendance-choice is-${option.tone}${currentStatus === option.value ? " is-active" : ""}`}
                              onClick={() =>
                                setAttendanceMap((current) => ({
                                  ...current,
                                  [student.id]: option.value,
                                }))
                              }
                            >
                              <span>{option.shortLabel}</span>
                              <small>{option.value}</small>
                            </button>
                          ))}
                        </div>
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

        <div className="staff-attendance-savebar">
          <div className="staff-attendance-savebar-copy">
            <strong>Ready to save this class attendance?</strong>
            <span>
              {presentCount} present, {lateCount} late, {absentCount} absent
            </span>
          </div>
          <button type="button" className="staff-action-btn is-green staff-save-btn" onClick={handleSaveAttendance} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </section>

      {modalState.isOpen ? (
        <div className="staff-modal-backdrop" onClick={handleModalClose}>
          <article className={`staff-modal-card is-${modalState.tone}`} onClick={(event) => event.stopPropagation()}>
            <div className="staff-modal-copy">
              <strong>{modalState.title}</strong>
              <p>{modalState.message}</p>
            </div>
            <div className="staff-modal-actions">
              <button type="button" className="staff-action-btn is-green" onClick={handleModalClose}>
                {modalState.shouldRedirect ? "Back to Classes" : "Close"}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
