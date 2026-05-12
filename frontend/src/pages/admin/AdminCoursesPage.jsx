import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createCourse, deleteCourse, fetchCourses, updateCourse } from "./adminApi";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

const initialForm = {
  name: "",
  staffId: "",
};

const actionButtonStyle = {
  border: 0,
  borderRadius: "12px",
  padding: "12px 16px",
  background: "#16a34a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const deleteButtonStyle = {
  ...actionButtonStyle,
  background: "#dc2626",
};

function isTeacherRole(role) {
  return /teacher|lecturer|professor|instructor/i.test(String(role || ""));
}

function getCourseAccent(index) {
  return ["is-mint", "is-sky", "is-sand"][index % 3];
}

export default function AdminCoursesPage() {
  const { currentTime, searchTerm } = useOutletContext();
  const { staffMembers, loading: staffLoading, usingFallbackData } = useAdminDirectoryData();
  const [directoryView, setDirectoryView] = useState("courses");
  const [viewMode, setViewMode] = useState("grid");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [createFormData, setCreateFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);

  useEffect(() => {
    let isCancelled = false;

    async function loadCourses() {
      try {
        setLoading(true);
        const data = await fetchCourses();
        if (!isCancelled) {
          setCourses(data);
        }
      } catch (error) {
        if (!isCancelled) {
          setSubmitError(error instanceof Error ? error.message : "Unable to load courses right now.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadCourses();
    return () => {
      isCancelled = true;
    };
  }, []);

  async function refreshCourses() {
    const data = await fetchCourses();
    setCourses(data);
  }

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return courses;

    return courses.filter((course) =>
      [course.name, course.staffCode, course.position, course.status].some((value) =>
        String(value).toLowerCase().includes(term),
      ),
    );
  }, [courses, searchTerm]);

  const assignedCourses = useMemo(
    () => courses.filter((course) => course.staffId).length,
    [courses],
  );

  const unassignedCourses = courses.length - assignedCourses;

  const activePositions = useMemo(
    () => new Set(courses.map((course) => course.position).filter(Boolean)).size,
    [courses],
  );

  const teacherStaff = useMemo(
    () =>
      staffMembers
        .filter((member) => isTeacherRole(member.role))
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name)),
    [staffMembers],
  );

  const teacherCourseGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const groups = teacherStaff
      .map((teacher) => {
        const teacherCourses = courses.filter((course) => course.staffId === teacher.id);
        return {
          ...teacher,
          courses: teacherCourses,
          courseCount: teacherCourses.length,
        };
      })
      .filter((teacher) => teacher.courseCount > 0);

    if (!term) return groups;

    return groups.filter((teacher) =>
      [
        teacher.name,
        teacher.role,
        teacher.displayId,
        ...teacher.courses.map((course) => `${course.name} ${course.position} ${course.staffCode}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [courses, searchTerm, teacherStaff]);

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

  function openEditModal(course) {
    setEditingCourse(course);
    setEditFormData({
      name: course.name,
      staffId: course.staffId || "",
    });
    setSubmitError("");
    setSubmitSuccess("");
  }

  async function handleCreateCourse(event) {
    event.preventDefault();

    if (usingFallbackData) {
      setSubmitError("Course management is disabled while staff data is using sample data. Please reconnect the API first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await createCourse({
        name: createFormData.name,
        staff_id: createFormData.staffId || null,
      });

      await refreshCourses();
      setCreateFormData(initialForm);
      setIsCreateOpen(false);
      setSubmitSuccess("Course created successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create course right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateCourse(event) {
    event.preventDefault();

    if (!editingCourse) return;

    if (usingFallbackData) {
      setSubmitError("Course management is disabled while staff data is using sample data. Please reconnect the API first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await updateCourse({
        id: editingCourse.id,
        name: editFormData.name,
        staff_id: editFormData.staffId || null,
      });

      await refreshCourses();
      setEditingCourse(null);
      setEditFormData(initialForm);
      setSubmitSuccess("Course updated successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to update course right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCourse(course) {
    if (usingFallbackData) {
      setSubmitError("Course management is disabled while staff data is using sample data. Please reconnect the API first.");
      return;
    }

    const confirmed = window.confirm(`Delete ${course.name}?`);
    if (!confirmed) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await deleteCourse(course.id);
      await refreshCourses();
      if (editingCourse?.id === course.id) {
        setEditingCourse(null);
        setEditFormData(initialForm);
      }
      setSubmitSuccess(`${course.name} was deleted successfully.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to delete course right now.");
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
          <p>Design, assign, and maintain course ownership from one place. Updated at {nowLabel}.</p>
        </div>
        <div className="admin-panel-actions">
          <div className="admin-status-pill">
            {loading || staffLoading ? "Loading..." : usingFallbackData ? "Partial live data" : "Live data"}
          </div>
        </div>
      </div>

      {submitSuccess ? (
        <article className="admin-activity-item admin-feedback-success">
          <strong>Course updated</strong>
          <p>{submitSuccess}</p>
        </article>
      ) : null}

      {submitError ? (
        <article className="admin-activity-item admin-feedback-error">
          <strong>Course action failed</strong>
          <p>{submitError}</p>
        </article>
      ) : null}

      <article className="admin-panel admin-course-hero">
       

        <div className="admin-course-hero-actions">
          <button
            type="button"
            style={actionButtonStyle}
            disabled={usingFallbackData}
            onClick={() => {
              setIsCreateOpen(true);
              setSubmitError("");
              setSubmitSuccess("");
            }}
          >
            Create Course
          </button>
         
        </div>
      </article>

      <div className="admin-stats">
        <article className="admin-stat-card">
          <div className="admin-stat-icon tone-green" />
          <div>
            <p>Total Courses</p>
            <strong>{courses.length}</strong>
            <small>Live course records</small>
          </div>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-icon tone-yellow" />
          <div>
            <p>Assigned</p>
            <strong>{assignedCourses}</strong>
            <small>{unassignedCourses} awaiting assignment</small>
          </div>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-icon tone-blue" />
          <div>
            <p>Teacher Pool</p>
            <strong>{teacherStaff.length}</strong>
            <small>{teacherCourseGroups.length} currently teaching</small>
          </div>
        </article>
      </div>

      {isCreateOpen ? (
        <div className="admin-modal-backdrop" onClick={() => !isSubmitting && setIsCreateOpen(false)}>
          <article className="admin-panel admin-staff-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-panel-head">
              <div>
                <h3>Create Course</h3>
                <p className="admin-muted-copy">Add a course and optionally assign a teacher immediately.</p>
              </div>
            </div>

            <form className="admin-create-form" onSubmit={handleCreateCourse}>
              <label className="admin-create-field">
                <span>Course Name</span>
                <input
                  type="text"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateInputChange}
                  placeholder="Computer Science"
                  required
                />
              </label>

              <label className="admin-create-field">
                <span>Course Lead</span>
                <select name="staffId" value={createFormData.staffId} onChange={handleCreateInputChange}>
                  <option value="">No teacher assigned yet</option>
                  {teacherStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} • {member.role}
                    </option>
                  ))}
                </select>
              </label>

              {!teacherStaff.length ? (
                <p className="admin-muted-copy">No teacher records found yet. Create staff with position `Teacher` first.</p>
              ) : null}

              <div className="admin-create-form-actions">
                <button type="submit" className="admin-report-action-btn is-create" style={actionButtonStyle} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Save Course"}
                </button>
                <button type="button" className="admin-create-cancel-btn" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      {editingCourse ? (
        <div className="admin-modal-backdrop" onClick={() => !isSubmitting && setEditingCourse(null)}>
          <article className="admin-panel admin-staff-edit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-panel-head">
              <div>
                <h3>Edit Course</h3>
                <p className="admin-muted-copy">Update the course name or move ownership to another teacher.</p>
              </div>
            </div>

            <form className="admin-create-form" onSubmit={handleUpdateCourse}>
              <label className="admin-create-field">
                <span>Course Name</span>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Course Lead</span>
                <select name="staffId" value={editFormData.staffId} onChange={handleEditInputChange}>
                  <option value="">No teacher assigned yet</option>
                  {teacherStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} • {member.role}
                    </option>
                  ))}
                </select>
              </label>

              {!teacherStaff.length ? (
                <p className="admin-muted-copy">No teacher records found yet. Create staff with position `Teacher` first.</p>
              ) : null}

              <div className="admin-create-form-actions">
                <button type="submit" className="admin-report-action-btn is-create" style={actionButtonStyle} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Course"}
                </button>
                <button type="button" className="admin-create-cancel-btn" onClick={() => setEditingCourse(null)} disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      <article className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3>Manage Courses</h3>
            <p className="admin-muted-copy">
              {searchTerm ? `Filtered by "${searchTerm}"` : "Switch between course cards and teacher load views."}
            </p>
          </div>
          <div className="admin-panel-actions">
            <div className="admin-view-switcher">
              {[
                { id: "courses", label: "Courses" },
                { id: "teachers", label: "Teachers & Courses" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={directoryView === mode.id ? "is-active" : ""}
                  onClick={() => setDirectoryView(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="admin-view-switcher">
              {["grid", "card", "list"].map((mode) => (
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
        </div>

        {directoryView === "courses" ? (
          <div className={`admin-course-grid is-${viewMode}`}>
            {filteredCourses.length ? (
              filteredCourses.map((course, index) => {
                const assignedStaff = staffMembers.find((member) => member.id === course.staffId);

                return (
                  <article key={course.id} className={`admin-course-card ${getCourseAccent(index)}`}>
                    <div className="admin-course-card-head">
                      <div>
                        <span className="admin-course-chip">{course.status}</span>
                        <h3>{course.name}</h3>
                        <p>{course.staffCode}</p>
                      </div>
                      <div className="admin-course-actions">
                        <button type="button" onClick={() => openEditModal(course)} disabled={usingFallbackData || isSubmitting}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => handleDeleteCourse(course)}
                          disabled={usingFallbackData || isSubmitting}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    

                    <div className="admin-course-meta">
                      <span>Lead Role</span>
                      <strong>{course.position}</strong>
                    </div>
                    <div className="admin-course-meta">
                      <span>Assigned Teacher</span>
                      <strong>{assignedStaff ? assignedStaff.name : "Waiting for assignment"}</strong>
                    </div>
                  </article>
                );
              })
            ) : (
              <article className="admin-activity-item">
                <strong>No courses found</strong>
                <p>{searchTerm ? `No course matches "${searchTerm}".` : "Create your first course to start managing it here."}</p>
              </article>
            )}
          </div>
        ) : (
          <div className={`admin-course-grid admin-teacher-course-grid is-${viewMode}`}>
            {teacherCourseGroups.length ? (
              teacherCourseGroups.map((teacher, index) => (
                <article key={teacher.id} className={`admin-course-card admin-teacher-course-card ${getCourseAccent(index)}`}>
                  <div className="admin-course-card-head">
                    <div>
                      <span className="admin-course-chip">{teacher.courseCount} Courses</span>
                      <h3>{teacher.name}</h3>
                      <p>{teacher.role} • {teacher.displayId}</p>
                    </div>
                    <div className="admin-teacher-badge">
                      <strong>{teacher.courseCount}</strong>
                      <span>assigned</span>
                    </div>
                  </div>

                  <div className="admin-teacher-course-stack">
                    {teacher.courses.map((course) => (
                      <div key={course.id} className="admin-teacher-course-pill">
                        <strong>{course.name}</strong>
                        <span>{course.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-course-meta">
                    <span>Office</span>
                    <strong>{teacher.office}</strong>
                  </div>
                  <div className="admin-course-meta">
                    <span>Teaching Load</span>
                    <strong>{teacher.courseCount} active course{teacher.courseCount > 1 ? "s" : ""}</strong>
                  </div>
                </article>
              ))
            ) : (
              <article className="admin-activity-item">
                <strong>No teacher-course matches found</strong>
                <p>
                  {teacherStaff.length
                    ? "Teachers exist, but no courses are assigned to them yet."
                    : "No teacher records found yet. Create staff with position `Teacher` first."}
                </p>
              </article>
            )}
          </div>
        )}
      </article>

      {editingCourse ? (
        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Danger Zone</h3>
              <p className="admin-muted-copy">Delete the current course if it should no longer exist in the system.</p>
            </div>
          </div>

          <button
            type="button"
            style={deleteButtonStyle}
            disabled={usingFallbackData || isSubmitting}
            onClick={() => handleDeleteCourse(editingCourse)}
          >
            {isSubmitting ? "Deleting..." : `Delete ${editingCourse.name}`}
          </button>
        </article>
      ) : null}
    </section>
  );
}
