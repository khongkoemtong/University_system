import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { createClass, deleteClass, updateClass } from "../admin/adminApi";

const initialForm = {
  name: "",
  classCode: "",
  maxStudents: "30",
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function StaffSectionPage() {
  const {
    pageTitle,
    filteredStudents,
    currentTime,
    classes,
    authUser,
    sessionToken,
    dataLoading,
    dataError,
    refreshData,
  } = useOutletContext();
  const time = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const classList = useMemo(
    () => classes.map((item) => ({ ...item, slug: item.slug || slugify(item.classCode || item.name) })),
    [classes],
  );
  const [classView, setClassView] = useState("grid");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [createFormData, setCreateFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);

  const maleStudents = useMemo(
    () => filteredStudents.filter((student) => student.gender === "Male").length,
    [filteredStudents],
  );
  const femaleStudents = useMemo(
    () => filteredStudents.filter((student) => student.gender === "Female").length,
    [filteredStudents],
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

  function openEditForm(classItem) {
    setEditingClass(classItem);
    setEditFormData({
      name: classItem.name,
      classCode: classItem.classCode,
      maxStudents: String(classItem.maxStudents),
    });
    setSubmitError("");
    setSubmitSuccess("");
    setIsCreateOpen(false);
  }

  async function handleCreateClass(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await createClass(
        {
          name: createFormData.name,
          class_code: createFormData.classCode,
          max_students: Number.parseInt(createFormData.maxStudents, 10),
        },
        sessionToken,
      );
      await refreshData();
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
      await updateClass(
        {
          id: editingClass.id,
          name: editFormData.name,
          class_code: editFormData.classCode,
          max_students: Number.parseInt(editFormData.maxStudents, 10),
        },
        sessionToken,
      );
      await refreshData();
      setEditingClass(null);
      setEditFormData(initialForm);
      setSubmitSuccess("Class updated successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to update class right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteClass(classItem) {
    const confirmed = window.confirm(`Delete ${classItem.name}?`);
    if (!confirmed) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await deleteClass(classItem.id, sessionToken);
      await refreshData();
      if (editingClass?.id === classItem.id) {
        setEditingClass(null);
        setEditFormData(initialForm);
      }
      setSubmitSuccess(`${classItem.name} was deleted successfully.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to delete class right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pageTitle === "Manage Attendance") {
    return (
      <section className="staff-page">
        <div className="staff-page-head">
          <div>
            <h2>Manage Classes</h2>
            <p>Your class workspace updated at {time}.</p>
          </div>
          <div className="staff-class-actions">
            <button
              type="button"
              className="staff-action-btn is-green"
              onClick={() => {
                setIsCreateOpen((current) => !current);
                setEditingClass(null);
                setSubmitError("");
                setSubmitSuccess("");
              }}
            >
              {isCreateOpen ? "Close Form" : "Create Class"}
            </button>
          </div>
        </div>

        {submitSuccess ? (
          <section className="staff-content-panel">
            <div className="staff-content-panel-head">
              <div>
                <h3>Class Updated</h3>
                <p>{submitSuccess}</p>
              </div>
            </div>
          </section>
        ) : null}

        {submitError || dataError ? (
          <section className="staff-content-panel">
            <div className="staff-content-panel-head">
              <div>
                <h3>Action Failed</h3>
                <p>{submitError || dataError}</p>
              </div>
            </div>
          </section>
        ) : null}

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
              <strong>{filteredStudents.length}</strong>
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

        {isCreateOpen ? (
          <section className="staff-content-panel">
            <div className="staff-content-panel-head">
              <div>
                <h3>Create New Class</h3>
                <p>This class will be assigned to {authUser.name} automatically.</p>
              </div>
            </div>

            <form className="staff-class-form" onSubmit={handleCreateClass}>
              <div className="staff-class-form-grid">
                <label className="staff-class-field">
                  <span>Class Name</span>
                  <input type="text" name="name" value={createFormData.name} onChange={handleCreateInputChange} required />
                </label>
                <label className="staff-class-field">
                  <span>Class Code</span>
                  <input type="text" name="classCode" value={createFormData.classCode} onChange={handleCreateInputChange} required />
                </label>
                <label className="staff-class-field">
                  <span>Max Students</span>
                  <input type="number" min="1" name="maxStudents" value={createFormData.maxStudents} onChange={handleCreateInputChange} required />
                </label>
              </div>

              <div className="staff-class-actions">
                <button type="submit" className="staff-action-btn is-green" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Save Class"}
                </button>
                <button type="button" className="staff-action-btn is-muted" disabled={isSubmitting} onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {editingClass ? (
          <section className="staff-content-panel">
            <div className="staff-content-panel-head">
              <div>
                <h3>Edit {editingClass.name}</h3>
                <p>Update the class details you manage.</p>
              </div>
            </div>

            <form className="staff-class-form" onSubmit={handleUpdateClass}>
              <div className="staff-class-form-grid">
                <label className="staff-class-field">
                  <span>Class Name</span>
                  <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} required />
                </label>
                <label className="staff-class-field">
                  <span>Class Code</span>
                  <input type="text" name="classCode" value={editFormData.classCode} onChange={handleEditInputChange} required />
                </label>
                <label className="staff-class-field">
                  <span>Max Students</span>
                  <input type="number" min="1" name="maxStudents" value={editFormData.maxStudents} onChange={handleEditInputChange} required />
                </label>
              </div>

              <div className="staff-class-actions">
                <button type="submit" className="staff-action-btn is-green" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Class"}
                </button>
                <button type="button" className="staff-action-btn is-blue" disabled={isSubmitting} onClick={() => handleDeleteClass(editingClass)}>
                  Delete Class
                </button>
                <button type="button" className="staff-action-btn is-muted" disabled={isSubmitting} onClick={() => setEditingClass(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>My Classes</h3>
              <p>Open a class for attendance or update its setup.</p>
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
            {classList.length ? (
              classList.map((classItem) => {
                const studentCount = filteredStudents.filter(
                  (student) => student.classId === classItem.id || student.className === classItem.name,
                ).length;

                return (
                  <article key={classItem.id} className="staff-class-item staff-class-card-shell">
                    <div>
                      <span className="staff-class-label">{classItem.status}</span>
                      <strong>{classItem.name}</strong>
                      <p>{classItem.classCode}</p>
                    </div>
                    <div className="staff-class-item-meta">
                      <span>{studentCount} students</span>
                      <span>{classItem.openSeats} open seats</span>
                      <span>{classItem.teacherName || authUser.name}</span>
                    </div>
                    <div className="staff-class-card-actions">
                      <Link to={`/staff/manage-attendance/${classItem.slug}`} className="staff-class-link-btn">
                        Open
                      </Link>
                      <button type="button" className="staff-action-btn is-blue" onClick={() => openEditForm(classItem)}>
                        Edit
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <article className="staff-content-panel">
                <div className="staff-content-panel-head">
                  <div>
                    <h3>{dataLoading ? "Loading classes" : "No classes yet"}</h3>
                    <p>{dataLoading ? "Please wait while your assigned classes load." : "Create your first class to begin managing attendance."}</p>
                  </div>
                </div>
              </article>
            )}
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
              {pageTitle === "Student's List"
                ? "Searchable attendance list for your assigned students."
                : "Attendance summaries for reporting and review."}
            </p>
          </div>
        </div>

        <div className="staff-student-table">
          {filteredStudents.map((student) => (
            <article key={student.id} className="staff-student-row">
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
              <span className={`staff-status ${String(student.status || "present").toLowerCase()}`}>{student.status}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
