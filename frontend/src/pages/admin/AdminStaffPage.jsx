import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { createStaffAccount, deleteStaffAccount, updateStaffAccount } from "./adminApi";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

const initialForm = {
  name: "",
  email: "",
  password: "",
  staffCode: "",
  position: "Registrar",
};

const createButtonStyle = {
  border: 0,
  borderRadius: "12px",
  padding: "12px 16px",
  background: "#16a34a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

export default function AdminStaffPage() {
  const { currentTime } = useOutletContext();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStaffId, setActiveStaffId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [createFormData, setCreateFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const { staffMembers, loading, usingFallbackData, refresh } = useAdminDirectoryData();
  const menuRef = useRef(null);

  const maleCount = useMemo(
    () => staffMembers.filter((member) => member.gender === "Male").length,
    [staffMembers],
  );
  const femaleCount = useMemo(
    () => staffMembers.filter((member) => member.gender === "Female").length,
    [staffMembers],
  );
  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpenMenuId("");
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpenMenuId("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  function openCreateForm() {
    setIsCreateOpen(true);
    setCreateFormData(initialForm);
    setOpenMenuId("");
    setSubmitError("");
    setSubmitSuccess("");
  }

  function openEditForm(member) {
    setEditingStaff(member);
    setEditFormData({
      name: member.name,
      email: member.email,
      password: "",
      staffCode: member.displayId,
      position: member.role,
    });
    setIsEditOpen(true);
    setOpenMenuId("");
    setSubmitError("");
    setSubmitSuccess("");
  }

  async function handleCreateStaff(event) {
    event.preventDefault();

    if (usingFallbackData) {
      setSubmitError("Staff actions are disabled while the page is using sample data. Please reconnect the API first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await createStaffAccount({
        name: createFormData.name,
        email: createFormData.email,
        password: createFormData.password,
        staffCode: createFormData.staffCode,
        position: createFormData.position,
      });

      setSubmitSuccess(`${createFormData.name} was created successfully.`);
      refresh();
      setCreateFormData(initialForm);
      setIsCreateOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create staff right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStaff(event) {
    event.preventDefault();

    if (usingFallbackData) {
      setSubmitError("Staff actions are disabled while the page is using sample data. Please reconnect the API first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      if (!editingStaff?.userId) {
        throw new Error("Missing linked user_id for this staff record.");
      }

      await updateStaffAccount({
        userId: editingStaff.userId,
        staffId: editingStaff.id,
        name: editFormData.name,
        email: editFormData.email,
        staffCode: editFormData.staffCode,
        position: editFormData.position,
      });

      setSubmitSuccess(`${editFormData.name} was updated successfully.`);
      refresh();
      setEditingStaff(null);
      setEditFormData(initialForm);
      setIsEditOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to update staff right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteStaff(member) {
    if (usingFallbackData) {
      setSubmitError("Staff actions are disabled while the page is using sample data. Please reconnect the API first.");
      return;
    }

    if (!member.userId) {
      setSubmitError("Missing linked user_id for this staff record.");
      return;
    }

    const confirmed = window.confirm(`Delete ${member.name}? This will remove the user account too.`);
    if (!confirmed) return;

    setActiveStaffId(member.id);
    setOpenMenuId("");
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await deleteStaffAccount({
        userId: member.userId,
        staffId: member.id,
      });

      if (editingStaff?.id === member.id) {
        setEditingStaff(null);
        setEditFormData(initialForm);
        setIsEditOpen(false);
      }

      refresh();
      setSubmitSuccess(`${member.name} was deleted successfully.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to delete staff right now.");
    } finally {
      setActiveStaffId("");
    }
  }

  const positionSummary = useMemo(
    () =>
      Object.values(
        staffMembers.reduce((accumulator, member) => {
          if (!accumulator[member.roleSlug]) {
            accumulator[member.roleSlug] = {
              slug: member.roleSlug,
              name: member.role,
              type: member.office,
              count: 0,
              male: 0,
              female: 0,
            };
          }

          accumulator[member.roleSlug].count += 1;
          if (member.gender === "Male") accumulator[member.roleSlug].male += 1;
          if (member.gender === "Female") accumulator[member.roleSlug].female += 1;

          return accumulator;
        }, {}),
      ),
    [staffMembers],
  );

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <p>Manage all staff positions and members updated at {nowLabel}.</p>
        </div>
        <div className="admin-panel-actions">
         
          <div className="admin-status-pill">
            {loading ? "Loading..." : usingFallbackData ? "Sample data" : "Live data"}
          </div>
        </div>
      </div>

      {submitSuccess ? (
        <article className="admin-activity-item admin-feedback-success">
          <strong>Staff created</strong>
          <p>{submitSuccess}</p>
        </article>
      ) : null}

      {submitError ? (
        <article className="admin-activity-item admin-feedback-error">
          <strong>Create staff failed</strong>
          <p>{submitError}</p>
        </article>
      ) : null}

      {isCreateOpen ? (
        <article className="admin-panel admin-create-staff-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Create New Staff</h3>
              <p className="admin-muted-copy">
                This will create both the user account and the linked staff profile from your backend API.
              </p>
            </div>
          </div>

          <form className="admin-create-form" onSubmit={handleCreateStaff}>
            <label className="admin-create-field">
              <span>Full Name</span>
              <input
                type="text"
                name="name"
                value={createFormData.name}
                onChange={handleCreateInputChange}
                placeholder="Enter staff full name"
                required
              />
            </label>

            <label className="admin-create-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={createFormData.email}
                onChange={handleCreateInputChange}
                placeholder="staff@email.com"
                required
              />
            </label>

            <label className="admin-create-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={createFormData.password}
                onChange={handleCreateInputChange}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </label>

            <label className="admin-create-field">
              <span>Staff Code</span>
              <input
                type="text"
                name="staffCode"
                value={createFormData.staffCode}
                onChange={handleCreateInputChange}
                placeholder="STF-2001"
                required
              />
            </label>

            <label className="admin-create-field">
              <span>Position</span>
              <select
                name="position"
                value={createFormData.position}
                onChange={handleCreateInputChange}
              >
                <option value="Registrar">Registrar</option>
                <option value="Teacher">Teacher</option>
                <option value="IT Support">IT Support</option>
                <option value="Accounting">Accounting</option>
                <option value="Student Affairs">Student Affairs</option>
              </select>
            </label>

            <div className="admin-create-form-actions">
              <button
                type="submit"
                className="admin-report-action-btn is-create"
                style={createButtonStyle}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Save Staff"}
              </button>
              <button
                type="button"
                className="admin-create-cancel-btn"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateFormData(initialForm);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </article>
      ) : null}

      {isEditOpen && editingStaff ? (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setIsEditOpen(false);
            setEditingStaff(null);
            setEditFormData(initialForm);
          }}
        >
          <article
            className="admin-panel admin-staff-edit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-panel-head">
              <div>
                <h3>Update Staff</h3>
                <p className="admin-muted-copy">
                  Current staff data is shown here so you can edit it without touching the create form.
                </p>
              </div>
            </div>

            <form className="admin-create-form" onSubmit={handleUpdateStaff}>
              <label className="admin-create-field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                />
              </label>

              <label className="admin-create-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                />
              </label>

              <label className="admin-create-field">
                <span>Staff Code</span>
                <input
                  type="text"
                  name="staffCode"
                  value={editFormData.staffCode}
                  onChange={handleEditInputChange}
                  required
                />
              </label>

              <label className="admin-create-field">
                <span>Position</span>
                <select
                  name="position"
                  value={editFormData.position}
                  onChange={handleEditInputChange}
                >
                  <option value="Registrar">Registrar</option>
                  <option value="Teacher">Teacher</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Student Affairs">Student Affairs</option>
                </select>
              </label>

              <div className="admin-create-form-actions">
                <button
                  type="submit"
                  className="admin-report-action-btn is-create"
                  style={createButtonStyle}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Staff"}
                </button>
                <button
                  type="button"
                  className="admin-create-cancel-btn"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingStaff(null);
                    setEditFormData(initialForm);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      <div className="admin-staff-summary">
        <article className="admin-staff-summary-card">
          <p>Total Staff</p>
          <strong>{staffMembers.length}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Total Position</p>
          <strong>{positionSummary.length}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Male Staff</p>
          <strong>{maleCount}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Female Staff</p>
          <strong>{femaleCount}</strong>
        </article>
      </div>

      <article className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3>Staff by Position</h3>
            <p className="admin-muted-copy">Click a position to open the full staff details page.</p>
          </div>
          <div className="admin-panel-actions">
            <button
              type="button"
              style={createButtonStyle}
              onClick={() => {
                openCreateForm();
              }}
              disabled={usingFallbackData}
            >
              Create Staff
            </button>
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
        </div>

        <div className={`admin-staff-position-grid is-${viewMode}`}>
          {positionSummary.map((position) => (
            <Link
              key={position.slug}
              to={`/admin/staff/${position.slug}`}
              className="admin-staff-position-card"
            >
              <div>
                <span className="admin-staff-type-pill">{position.type}</span>
                <strong>{position.name}</strong>
                <p>{position.count} staff members</p>
              </div>
              <div className="admin-staff-position-meta">
                <span>Male {position.male}</span>
                <span>Female {position.female}</span>
                <span className="admin-staff-view-link">View</span>
              </div>
            </Link>
          ))}
        </div>
      </article>

      <article className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3>Manage Staff Accounts</h3>
            <p className="admin-muted-copy">Edit names, email, staff code, position, or delete staff directly here.</p>
          </div>
        </div>

        <div className="admin-staff-people-grid">
          {staffMembers.map((member, index) => (
            <article key={member.id} className="admin-staff-person-card">
              <div className="admin-staff-person-head">
                <div className="admin-student-cell">
                  <span className={`avatar-tone-${(index % 3) + 1}`}>
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.displayId}</p>
                  </div>
                </div>
                <div className="admin-staff-card-menu" ref={openMenuId === member.id ? menuRef : null}>
                  <button
                    type="button"
                    className="admin-kebab-trigger"
                    aria-label={`Open actions for ${member.name}`}
                    aria-expanded={openMenuId === member.id}
                    onClick={() => setOpenMenuId((current) => (current === member.id ? "" : member.id))}
                  >
                    <span />
                    <span />
                    <span />
                  </button>

                  {openMenuId === member.id ? (
                    <div className="admin-kebab-menu">
                      <button
                        type="button"
                        className="admin-kebab-menu-item"
                        disabled={usingFallbackData}
                        onClick={() => openEditForm(member)}
                      >
                        Update Staff
                      </button>
                      <button
                        type="button"
                        className="admin-kebab-menu-item"
                        onClick={() => {
                          setOpenMenuId("");
                          navigate(`/admin/database/staff/${member.id}`);
                        }}
                      >
                        Open Detail
                      </button>
                      <button
                        type="button"
                        className="admin-kebab-menu-item is-danger"
                        disabled={usingFallbackData || activeStaffId === member.id}
                        onClick={() => handleDeleteStaff(member)}
                      >
                        {activeStaffId === member.id ? "Deleting..." : "Delete Staff"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="admin-staff-person-info">
                <div>
                  <span>Email</span>
                  <strong>{member.email}</strong>
                </div>
                <div>
                  <span>Position</span>
                  <strong>{member.role}</strong>
                </div>
                <div>
                  <span>Office</span>
                  <strong>{member.office}</strong>
                </div>
                <div>
                  <span>Shift</span>
                  <strong>{member.shift}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
