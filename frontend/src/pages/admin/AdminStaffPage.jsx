import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { staffMembers, staffPositions } from "./adminData";

export default function AdminStaffPage() {
  const { currentTime } = useOutletContext();
  const [viewMode, setViewMode] = useState("grid");

  const maleCount = useMemo(
    () => staffMembers.filter((member) => member.gender === "Male").length,
    [],
  );
  const femaleCount = useMemo(
    () => staffMembers.filter((member) => member.gender === "Female").length,
    [],
  );
  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const positionSummary = useMemo(
    () =>
      staffPositions.map((position) => {
        const people = staffMembers.filter((member) => member.roleSlug === position.slug);
        return {
          ...position,
          count: people.length,
          male: people.filter((member) => member.gender === "Male").length,
          female: people.filter((member) => member.gender === "Female").length,
        };
      }),
    [],
  );

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <h2>Staff</h2>
          <p>Manage all staff positions and members updated at {nowLabel}.</p>
        </div>
        <div className="admin-status-pill">All staff overview</div>
      </div>

      <div className="admin-staff-summary">
        <article className="admin-staff-summary-card">
          <p>Total Staff</p>
          <strong>{staffMembers.length}</strong>
        </article>
        <article className="admin-staff-summary-card">
          <p>Total Position</p>
          <strong>{staffPositions.length}</strong>
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
    </section>
  );
}
