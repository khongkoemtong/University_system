import { useMemo } from "react";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { staffMembers, staffPositions } from "./adminData";

export default function AdminStaffPositionPage() {
  const { currentTime, searchTerm } = useOutletContext();
  const { positionSlug } = useParams();

  const position = useMemo(
    () => staffPositions.find((item) => item.slug === positionSlug),
    [positionSlug],
  );

  const positionStaff = useMemo(() => {
    if (!position) return [];
    return staffMembers.filter((member) => member.roleSlug === position.slug);
  }, [position]);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return positionStaff;
    return positionStaff.filter((member) =>
      [member.name, member.id, member.role, member.phone, member.email, member.office, member.status]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [positionStaff, searchTerm]);

  if (!position) {
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
                      <p>{member.id}</p>
                    </div>
                  </div>
                  <span className="admin-status-pill is-soft">{member.status}</span>
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
