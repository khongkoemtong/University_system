import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { deleteStaffAccount, updateStaffAccount } from "./adminApi";
import { useAdminDirectoryData } from "./useAdminDirectoryData";

const initialEditForm = {
  name: "",
  email: "",
  staffCode: "",
  position: "Registrar",
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

export default function AdminStaffPositionPage() {
  const { currentTime, searchTerm } = useOutletContext();
  const { positionSlug } = useParams();
  const navigate = useNavigate();
  const { staffMembers, loading, usingFallbackData, refresh } = useAdminDirectoryData();
  const [openMenuId, setOpenMenuId] = useState("");
  const [activeStaffId, setActiveStaffId] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editFormData, setEditFormData] = useState(initialEditForm);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpenMenuId("");
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpenMenuId("");
        setIsEditOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const position = useMemo(
    () => {
      const match = staffMembers.find((item) => item.roleSlug === positionSlug);
      return match ? { slug: match.roleSlug, name: match.role, type: match.office } : null;
    },
    [positionSlug, staffMembers],
  );

  const positionStaff = useMemo(() => {
    if (!position) return [];
    return staffMembers.filter((member) => member.roleSlug === position.slug);
  }, [position, staffMembers]);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return positionStaff;
    return positionStaff.filter((member) =>
      [member.name, member.id, member.displayId, member.role, member.phone, member.email, member.office, member.status]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [positionStaff, searchTerm]);

  function openEditForm(member) {
    setEditingStaff(member);
    setEditFormData({
      name: member.name,
      email: member.email,
      staffCode: member.displayId,
      position: member.role,
    });
    setIsEditOpen(true);
    setOpenMenuId("");
    setSubmitError("");
    setSubmitSuccess("");
  }

  function handleEditInputChange(event) {
    const { name, value } = event.target;
    setEditFormData((current) => ({
      ...current,
      [name]: value,
    }));
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

      refresh();
      setSubmitSuccess(`${editFormData.name} was updated successfully.`);
      setEditingStaff(null);
      setEditFormData(initialEditForm);
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
        setEditFormData(initialEditForm);
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

  if (!position) {
    if (loading) {
      return (
        <section className="admin-overview">
          <article className="admin-panel">
            <p>Loading staff position...</p>
          </article>
        </section>
      );
    }

    return <Navigate to="/admin/staff" replace />;
  }

  const maleCount = positionStaff.filter((member) => member.gender === "Male").length;
  const femaleCount = positionStaff.filter((member) => member.gender === "Female").length;
  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <div className="admin-staff-breadcrumbs">
            <Link to="/admin/staff">Staff</Link>
            <span>/</span>
            <strong>{position.name}</strong>
          </div>
          <h2>{position.name}</h2>
          <p>{position.type} details updated at {nowLabel}.</p>
        </div>
        <div className="admin-status-pill">{filteredStaff.length} people shown</div>
      </div>

      {submitSuccess ? (
        <article className="admin-activity-item admin-feedback-success">
          <strong>Staff updated</strong>
          <p>{submitSuccess}</p>
        </article>
      ) : null}

      {submitError ? (
        <article className="admin-activity-item admin-feedback-error">
          <strong>Staff action failed</strong>
          <p>{submitError}</p>
        </article>
      ) : null}

      {isEditOpen && editingStaff ? (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setIsEditOpen(false);
            setEditingStaff(null);
            setEditFormData(initialEditForm);
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
                  Current staff data is shown here so you can edit it safely from this position page.
                </p>
              </div>
            </div>

            <form className="admin-create-form" onSubmit={handleUpdateStaff}>
              <label className="admin-create-field">
                <span>Full Name</span>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Email</span>
                <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Staff Code</span>
                <input type="text" name="staffCode" value={editFormData.staffCode} onChange={handleEditInputChange} required />
              </label>

              <label className="admin-create-field">
                <span>Position</span>
                <select name="position" value={editFormData.position} onChange={handleEditInputChange}>
                  <option value="Registrar">Registrar</option>
                  <option value="Teacher">Teacher</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Student Affairs">Student Affairs</option>
                </select>
              </label>

              <div className="admin-create-form-actions">
                <button type="submit" className="admin-report-action-btn is-create" style={actionButtonStyle} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Staff"}
                </button>
                <button
                  type="button"
                  className="admin-create-cancel-btn"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingStaff(null);
                    setEditFormData(initialEditForm);
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
          <strong>{positionStaff.length}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Male Staff</p>
          <strong>{maleCount}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Female Staff</p>
          <strong>{femaleCount}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Search Result</p>
          <strong>{filteredStaff.length}</strong>
        </article>
      </div>

      <article className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3>{position.name} Staff List</h3>
            <p className="admin-muted-copy">
              {searchTerm ? `Filtered by "${searchTerm}"` : "Use the top search bar to find people."}
            </p>
          </div>
        </div>

        <div className="admin-staff-people-grid">
          {filteredStaff.length ? (
            filteredStaff.map((member, index) => (
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
                    <span>Gender</span>
                    <strong>{member.gender}</strong>
                  </div>
                  <div>
                    <span>Shift</span>
                    <strong>{member.shift}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{member.phone}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{member.email}</strong>
                  </div>
                  <div>
                    <span>Office</span>
                    <strong>{member.office}</strong>
                  </div>
                  <div>
                    <span>Position</span>
                    <strong>{member.role}</strong>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className="admin-activity-item">
              <strong>No people found</strong>
              <p>Try another name, email, office, or staff ID in the top search bar.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  );
}
