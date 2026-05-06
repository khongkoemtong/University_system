import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { adminNavItems, scheduleItems, staffMembers, staffReports, students, teachers } from "./adminData";

const pageContent = {
  Report: {
    description: "Academic reporting, summaries, and unresolved follow-up items.",
    metrics: [
      { label: "Reports", value: 18 },
      { label: "Pending", value: 5 },
      { label: "Resolved", value: 42 },
    ],
  },
  Staff: {
    description: "Staff management is available from the dedicated staff page.",
    metrics: [
      { label: "Teams", value: 4 },
      { label: "Members", value: 8 },
      { label: "Open", value: 0 },
    ],
  },
  Database: {
    description: "Academic records, system syncs, and data freshness.",
    metrics: [
      { label: "Tables", value: 27 },
      { label: "Backups", value: 3 },
      { label: "Alerts", value: 1 },
    ],
  },
  Attendance: {
    description: "Classroom attendance quality and late-arrival follow-ups.",
    metrics: [
      { label: "Present", value: "94%" },
      { label: "Late", value: 12 },
      { label: "Absent", value: 7 },
    ],
  },
  Settings: {
    description: "Configuration, permission review, and environment health.",
    metrics: [
      { label: "Roles", value: 8 },
      { label: "Policies", value: 16 },
      { label: "Pending", value: 2 },
    ],
  },
};

export default function AdminSectionPage() {
  const { pageTitle, currentTime, searchTerm } = useOutletContext();
  const [reportView, setReportView] = useState("list");
  const section = pageContent[pageTitle] ?? pageContent.Staff;
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staffReports;
    return staffReports.filter((item) =>
      [item.staffName, item.position, item.title, item.detail, item.status]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [searchTerm]);

  const spotlight = useMemo(() => {
    const source = {
      Report: students,
      Staff: scheduleItems,
      Database: teachers,
      Attendance: students,
      Settings: staffMembers,
    }[pageTitle];

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return source.slice(0, 3);
    }

    return source.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(term),
    );
  }, [pageTitle, searchTerm]);

  if (pageTitle === "Report") {
    return (
      <section className="admin-overview">
        <div className="admin-overview-head">
          <div>
            <h2>Report</h2>
            <p>Reports submitted by staff members, updated at {formattedTime}.</p>
          </div>
          <div className="admin-status-pill">{filteredReports.length} reports</div>
        </div>

        <div className="admin-section-metrics">
          {section.metrics.map((metric) => (
            <article key={metric.label} className="admin-panel admin-section-metric">
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Staff Reports</h3>
              <p className="admin-muted-copy">
                {searchTerm ? `Filtered by "${searchTerm}"` : "Showing all submitted staff reports."}
              </p>
            </div>
            <div className="admin-view-switcher">
              {["list", "card", "grid"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={reportView === mode ? "is-active" : ""}
                  onClick={() => setReportView(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className={`admin-report-grid is-${reportView}`}>
            {filteredReports.length ? (
              filteredReports.map((report, index) => (
                <Link key={report.id} to={`/admin/report/${report.id}`} className="admin-report-card">
                  <div className="admin-report-head">
                    <div className="admin-student-cell">
                      <span className={`avatar-tone-${(index % 3) + 1}`}>
                        {report.staffName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div>
                        <strong>{report.staffName}</strong>
                        <p>{report.position}</p>
                      </div>
                    </div>
                    <span className="admin-status-pill is-soft">{report.status}</span>
                  </div>

                  <div className="admin-report-body">
                    <strong>{report.title}</strong>
                    <p>{report.detail}</p>
                  </div>

                  <div className="admin-report-meta">
                    <span>{report.id}</span>
                    <span>{report.time}</span>
                  </div>
                </Link>
              ))
            ) : (
              <article className="admin-activity-item">
                <strong>No reports found</strong>
                <p>Try another staff name, position, or report keyword from the top search bar.</p>
              </article>
            )}
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <h2>{pageTitle}</h2>
          <p>{section.description}</p>
        </div>
        <div className="admin-status-pill">Updated at {formattedTime}</div>
      </div>

      <div className="admin-section-metrics">
        {section.metrics.map((metric) => (
          <article key={metric.label} className="admin-panel admin-section-metric">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-dual-grid">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>{pageTitle} Overview</h3>
              <p className="admin-muted-copy">
                This section is route-based now, so the sidebar actually navigates.
              </p>
            </div>
          </div>
          <div className="admin-detail-stack">
            {adminNavItems.slice(0, 4).map((item, index) => (
              <div key={item.label} className="admin-detail-row">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>
                    Operational workflow for {item.label.toLowerCase()} is available from this
                    admin panel.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Spotlight Results</h3>
              <p className="admin-muted-copy">
                {searchTerm ? `Filtered by "${searchTerm}"` : "Showing current highlights."}
              </p>
            </div>
          </div>
          <div className="admin-activity-list">
            {spotlight.length ? (
              spotlight.slice(0, 4).map((item, index) => (
                <article key={index} className="admin-activity-item">
                  <strong>{Object.values(item)[0]}</strong>
                  <p>{Object.values(item).slice(1).join(" • ")}</p>
                </article>
              ))
            ) : (
              <article className="admin-activity-item">
                <strong>No results found</strong>
                <p>Try another search term from the top bar.</p>
              </article>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
