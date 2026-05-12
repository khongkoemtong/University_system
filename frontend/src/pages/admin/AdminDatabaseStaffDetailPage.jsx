import { useState } from "react";
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

const deleteButtonStyle = {
  ...actionButtonStyle,
  background: "#dc2626",
};

export default function AdminDatabaseStaffDetailPage() {
  const { currentTime } = useOutletContext();
  const { staffId } = useParams();
  const navigate = useNavigate();
  const { staffMembers, loading, usingFallbackData, refresh } = useAdminDirectoryData();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [editFormData, setEditFormData] = useState(initialEditForm);

  const member = staffMembers.find((item) => item.id === staffId);

  function openEditForm() {
    if (!member) return;

    setEditFormData({
      name: member.name,
      email: member.email,
      staffCode: member.displayId,
      position: member.role,
    });
    setSubmitError("");
    setSubmitSuccess("");
    setIsEditOpen(true);
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

    if (!member?.userId) {
      setSubmitError("Missing linked user_id for this staff record.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await updateStaffAccount({
        userId: member.userId,
        staffId: member.id,
        name: editFormData.name,
        email: editFormData.email,
        staffCode: editFormData.staffCode,
        position: editFormData.position,
      });

      refresh();
      setSubmitSuccess(`${editFormData.name} was updated successfully.`);
      setIsEditOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to update staff right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteStaff() {
    if (usingFallbackData) {
      setSubmitError("Staff actions are disabled while the page is using sample data. Please reconnect the API first.");
      return;
    }

    if (!member?.userId) {
      setSubmitError("Missing linked user_id for this staff record.");
      return;
    }

    const confirmed = window.confirm(`Delete ${member.name}? This will remove the user account too.`);
    if (!confirmed) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await deleteStaffAccount({
        userId: member.userId,
        staffId: member.id,
      });

      navigate("/admin/staff", {
        replace: true,
        state: { message: `${member.name} was deleted successfully.` },
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to delete staff right now.");
      setIsSubmitting(false);
    }
  }

  if (!member) {
    if (loading) {
      return (
        <section className="admin-overview">
          <article className="admin-panel">
            <p>Loading staff profile...</p>
          </article>
        </section>
      );
    }

    return <Navigate to="/admin/database" replace />;
  }

  const updatedAt = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <div className="admin-staff-breadcrumbs">
            <Link to="/admin/database">Database</Link>
            <span>/</span>
            <Link to="/admin/staff">Staff</Link>
            <span>/</span>
            <strong>{member.name}</strong>
          </div>
          <h2>{member.name}</h2>
          <p>Staff profile detail updated at {updatedAt}.</p>
        </div>
        <div className="admin-panel-actions">
          <div className="admin-status-pill">{usingFallbackData ? "Sample data" : member.status}</div>
        </div>
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

      {isEditOpen ? (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            if (!isSubmitting) {
              setIsEditOpen(false);
            }
          }}
        >
          <article
            className="admin-panel admin-staff-edit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-panel-head">
              <div>
                <h3>Update Staff</h3>
                <p className="admin-muted-copy">Edit this staff record directly from the database detail page.</p>
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
                <button
                  type="submit"
                  className="admin-report-action-btn is-create"
                  style={actionButtonStyle}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Staff"}
                </button>
                <button
                  type="button"
                  className="admin-create-cancel-btn"
                  onClick={() => setIsEditOpen(false)}
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
          <p>Staff ID</p>
          <strong>{member.displayId}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Position</p>
          <strong>{member.role}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Shift</p>
          <strong>{member.shift}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Office</p>
          <strong>{member.office}</strong>
        </article>
      </div>

      <article className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3>Staff Information</h3>
            <p className="admin-muted-copy">Important staff data for database review.</p>
          </div>
          <div className="admin-panel-actions">
            <button
              type="button"
              style={actionButtonStyle}
              onClick={openEditForm}
              disabled={usingFallbackData || isSubmitting}
            >
              Update Staff
            </button>
            <button
              type="button"
              style={deleteButtonStyle}
              onClick={handleDeleteStaff}
              disabled={usingFallbackData || isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Staff"}
            </button>
          </div>
        </div>

        <div className="admin-staff-person-info">
          <div>
            <span>Full Name</span>
            <strong>{member.name}</strong>
          </div>
          <div>
            <span>Gender</span>
            <strong>{member.gender}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{member.email}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{member.phone}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{member.status}</strong>
          </div>
          <div>
            <span>Position</span>
            <strong>{member.role}</strong>
          </div>
        </div>
      </article>
    </section>
  );
}
