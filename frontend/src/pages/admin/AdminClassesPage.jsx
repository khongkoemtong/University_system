import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createClass, deleteClass, fetchClasses, updateClass } from "./adminApi";
import { useAdminDirectoryData } from "./useAdminDirectoryData";
import { getAuthSession } from "../auth/authSession";

const initialForm = {
  name: "",
  classCode: "",
  maxStudents: "30",
  teacherStaffId: "",
};

function getClassTone(index) {
  return ["is-mint", "is-sky", "is-sand"][index % 3];
}

export default function AdminClassesPage() {
  const { currentTime, searchTerm } = useOutletContext();
  const { students, staffMembers, loading: directoryLoading, usingFallbackData } = useAdminDirectoryData();
  const session = getAuthSession();
  const token = session?.token;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [createFormData, setCreateFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);

  useEffect(() => {
    let isCancelled = false;

    async function loadClasses() {
      try {
        setLoading(true);
        setSubmitError("");
        const data = await fetchClasses(token);

        if (!isCancelled) {
          setClasses(data);
          setSelectedClassId((current) => current || data[0]?.id || "");
        }
      } catch (error) {
        if (!isCancelled) {
          setSubmitError(error instanceof Error ? error.message : "Unable to load classes right now.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  async function refreshClasses() {
    const data = await fetchClasses(token);
    setClasses(data);
    setSelectedClassId((current) => {
      if (data.some((item) => item.id === current)) {
        return current;
      }

      return data[0]?.id || "";
    });
  }

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return classes;

    return classes.filter((item) =>
      [item.name, item.classCode, item.status, item.teacherName, item.teacherStaffCode, `${item.studentCount}`, `${item.maxStudents}`]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [classes, searchTerm]);

  const selectedClass =
    filteredClasses.find((item) => item.id === selectedClassId) ||
    classes.find((item) => item.id === selectedClassId) ||
    filteredClasses[0] ||
    classes[0] ||
    null;

  const selectedStudents = useMemo(() => {
    if (!selectedClass) return [];

    return students
      .filter((student) => student.classId === selectedClass.id || student.className === selectedClass.name)
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [selectedClass, students]);

  const totalCapacity = useMemo(
    () => classes.reduce((sum, item) => sum + item.maxStudents, 0),
    [classes],
  );

  const totalStudents = useMemo(
    () => classes.reduce((sum, item) => sum + item.studentCount, 0),
    [classes],
  );

  const fullClassCount = useMemo(
    () => classes.filter((item) => item.studentCount >= item.maxStudents).length,
    [classes],
  );

  const teacherStaff = useMemo(
    () =>
      staffMembers
        .filter((member) => /teacher|lecturer|professor|instructor/i.test(String(member.role || "")))
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name)),
    [staffMembers],
  );

  function handleCreateInputChange(event) {
    const { name, value } = event.target;
    setCreateFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditInputChange(event) {
    const { name, value } = event.target;
    setEditFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openEditModal(classroom) {
    setEditingClass(classroom);
    setEditFormData({
      name: classroom.name,
      classCode: classroom.classCode,
      maxStudents: String(classroom.maxStudents),
      teacherStaffId: classroom.teacherStaffId || "",
    });
    setSubmitError("");
    setSubmitSuccess("");
  }

  async function handleCreateClass(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await createClass({
        name: createFormData.name,
        class_code: createFormData.classCode,
        max_students: Number.parseInt(createFormData.maxStudents, 10),
        teacher_staff_id: createFormData.teacherStaffId || null,
      }, token);

      await refreshClasses();
      setCreateFormData(initialForm);
      setIsCreateOpen(false);
      setSubmitSuccess("Class created successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create class right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateClass(event) {
    event.preventDefault();

    if (!editingClass) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await updateClass({
        id: editingClass.id,
        name: editFormData.name,
        class_code: editFormData.classCode,
        max_students: Number.parseInt(editFormData.maxStudents, 10),
        teacher_staff_id: editFormData.teacherStaffId || null,
      }, token);

      await refreshClasses();
      setEditingClass(null);
      setSubmitSuccess("Class updated successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to update class right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteClass(classroom) {
    const confirmed = window.confirm(`Delete ${classroom.name}?`);
    if (!confirmed) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await deleteClass(classroom.id, token);
      await refreshClasses();

      if (editingClass?.id === classroom.id) {
        setEditingClass(null);
      }

      setSubmitSuccess(`${classroom.name} was deleted successfully.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to delete class right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <p>Manage every class from live API data and review student capacity at {nowLabel}.</p>
        </div>
        <div className="admin-panel-actions">
          <div className="admin-status-pill">
            {loading || directoryLoading ? "Loading..." : usingFallbackData ? "Partial live data" : "Live data"}
          </div>
        </div>
      </div>

      {submitSuccess ? (
        <article className="admin-activity-item admin-feedback-success">
          <strong>Class action saved</strong>
          <p>{submitSuccess}</p>
        </article>
      ) : null}

      {submitError ? (
        <article className="admin-activity-item admin-feedback-error">
          <strong>Class action failed</strong>
          <p>{submitError}</p>
        </article>
      ) : null}

      <article className="admin-panel admin-class-hero">
        <div className="admin-course-hero-copy">
          <span className="admin-course-kicker">Live Class API</span>
          <h3>Build classes, watch capacity, and open details fast.</h3>
          <p>Each student is assigned to the next available class automatically, and you can now assign each class to the right teacher.</p>
        </div>
        <div className="admin-course-hero-actions">
          <button
            type="button"
            className="admin-report-action-btn is-create"
            onClick={() => {
              setIsCreateOpen(true);
              setSubmitError("");
              setSubmitSuccess("");
            }}
          >
            Create Class
          </button>
        </div>
      </article>

      <div className="admin-stats">
        <article className="admin-stat-card">
          <div className="admin-stat-icon tone-green" />
          <div>
            <p>Total Classes</p>
            <strong>{classes.length}</strong>
            <small>Active class records</small>
          </div>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-icon tone-yellow" />
          <div>
            <p>Enrolled Students</p>
            <strong>{totalStudents}</strong>
            <small>{Math.max(totalCapacity - totalStudents, 0)} seats still open</small>
          </div>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-icon tone-blue" />
          <div>
            <p>Full Classes</p>
            <strong>{fullClassCount}</strong>
            <small>{classes.length - fullClassCount} still accepting students</small>
          </div>
        </article>
      </div>

      {isCreateOpen ? (
        <div className="admin-modal-backdrop" onClick={() => !isSubmitting && setIsCreateOpen(false)}>
          <article className="admin-panel admin-staff-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-panel-head">
              <div>
                <h3>Create Class</h3>
                <p className="admin-muted-copy">Add a new class with its code and seat limit.</p>
              </div>
            </div>

            <form className="admin-create-form" onSubmit={handleCreateClass}>
              <label className="admin-create-field">
                <span>Class Name</span>
                <input type="text" name="name" value={createFormData.name} onChange={handleCreateInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Class Code</span>
                <input type="text" name="classCode" value={createFormData.classCode} onChange={handleCreateInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Max Students</span>
                <input type="number" min="1" name="maxStudents" value={createFormData.maxStudents} onChange={handleCreateInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Assigned Teacher</span>
                <select name="teacherStaffId" value={createFormData.teacherStaffId || ""} onChange={handleCreateInputChange}>
                  <option value="">No teacher assigned yet</option>
                  {teacherStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} • {member.role}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-create-form-actions">
                <button type="submit" className="admin-report-action-btn is-create" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Save Class"}
                </button>
                <button type="button" className="admin-create-cancel-btn" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      {editingClass ? (
        <div className="admin-modal-backdrop" onClick={() => !isSubmitting && setEditingClass(null)}>
          <article className="admin-panel admin-staff-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-panel-head">
              <div>
                <h3>Edit Class</h3>
                <p className="admin-muted-copy">Update class info without leaving the page.</p>
              </div>
            </div>

            <form className="admin-create-form" onSubmit={handleUpdateClass}>
              <label className="admin-create-field">
                <span>Class Name</span>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Class Code</span>
                <input type="text" name="classCode" value={editFormData.classCode} onChange={handleEditInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Max Students</span>
                <input type="number" min="1" name="maxStudents" value={editFormData.maxStudents} onChange={handleEditInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Assigned Teacher</span>
                <select name="teacherStaffId" value={editFormData.teacherStaffId || ""} onChange={handleEditInputChange}>
                  <option value="">No teacher assigned yet</option>
                  {teacherStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} • {member.role}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-create-form-actions">
                <button type="submit" className="admin-report-action-btn is-create" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Class"}
                </button>
                <button type="button" className="admin-create-cancel-btn" onClick={() => setEditingClass(null)} disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      <div className="admin-class-layout">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>All Classes</h3>
              <p className="admin-muted-copy">{searchTerm ? `Filtered by "${searchTerm}"` : "Choose a class to read its detail and students."}</p>
            </div>
          </div>

          <div className="admin-class-grid">
            {filteredClasses.length ? (
              filteredClasses.map((classroom, index) => {
                const fillPercent = classroom.maxStudents ? Math.min((classroom.studentCount / classroom.maxStudents) * 100, 100) : 0;

                return (
                  <button
                    key={classroom.id}
                    type="button"
                    className={`admin-class-card ${getClassTone(index)}${selectedClass?.id === classroom.id ? " is-active" : ""}`}
                    onClick={() => setSelectedClassId(classroom.id)}
                  >
                    <div className="admin-class-card-head">
                      <span className="admin-course-chip">{classroom.status}</span>
                      <strong>{classroom.name}</strong>
                      <p>{classroom.classCode}</p>
                    </div>

                    <div className="admin-class-capacity">
                      <div className="admin-class-capacity-bar">
                        <span style={{ width: `${fillPercent}%` }} />
                      </div>
                      <small>{classroom.studentCount} / {classroom.maxStudents} students</small>
                    </div>
                  </button>
                );
              })
            ) : (
              <article className="admin-activity-item">
                <strong>No classes found</strong>
                <p>{searchTerm ? `No class matches "${searchTerm}".` : "Create your first class to start managing it here."}</p>
              </article>
            )}
          </div>
        </article>

        <article className="admin-panel admin-class-detail-panel">
          {selectedClass ? (
            <>
              <div className="admin-panel-head">
                <div>
                  <h3>{selectedClass.name}</h3>
                  <p className="admin-muted-copy">Class detail, capacity, and linked students from live API data.</p>
                </div>
                <div className="admin-panel-actions">
                  <button type="button" onClick={() => openEditModal(selectedClass)} disabled={isSubmitting}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDeleteClass(selectedClass)} disabled={isSubmitting}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="admin-class-detail-grid">
                <div className="admin-class-detail-item">
                  <span>Class Code</span>
                  <strong>{selectedClass.classCode}</strong>
                </div>
                <div className="admin-class-detail-item">
                  <span>Capacity</span>
                  <strong>{selectedClass.maxStudents}</strong>
                </div>
                <div className="admin-class-detail-item">
                  <span>Enrolled</span>
                  <strong>{selectedClass.studentCount}</strong>
                </div>
                <div className="admin-class-detail-item">
                  <span>Open Seats</span>
                  <strong>{selectedClass.openSeats}</strong>
                </div>
                <div className="admin-class-detail-item">
                  <span>Teacher</span>
                  <strong>{selectedClass.teacherName || "Not assigned"}</strong>
                </div>
              </div>

              <div className="admin-class-student-list">
                <div className="admin-class-student-list-head">
                  <strong>Student Detail</strong>
                  <span>{selectedStudents.length} shown</span>
                </div>

                {selectedStudents.length ? (
                  selectedStudents.map((student, index) => (
                    <article key={student.id} className="admin-class-student-row">
                      <div className="admin-student-cell">
                        <span className={`avatar-tone-${(index % 3) + 1}`}>
                          {student.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <div>
                          <strong>{student.name}</strong>
                          <p>{student.displayId}</p>
                        </div>
                      </div>

                      <div className="admin-class-student-meta">
                        <span>{student.gender}</span>
                        <span>{student.email}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="admin-activity-item">
                    <strong>No students in this class yet</strong>
                    <p>New students will land here automatically when earlier classes are full.</p>
                  </article>
                )}
              </div>
            </>
          ) : (
            <article className="admin-activity-item">
              <strong>No class selected</strong>
              <p>Create a class first to view detail here.</p>
            </article>
          )}
        </article>
      </div>
    </section>
  );
}
