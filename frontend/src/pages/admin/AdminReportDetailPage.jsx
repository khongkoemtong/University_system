import { useMemo } from "react";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { staffReports } from "./adminData";

function openReportPrint(report, mode) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  const heading =
    mode === "pdf" ? "Use the print dialog and choose Save as PDF." : "Print this report.";

  printWindow.document.write(`
    <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
          .wrap { max-width: 760px; margin: 0 auto; }
          .meta { color: #64748b; margin: 8px 0 24px; }
          .card { border: 1px solid #dbe5e2; border-radius: 16px; padding: 24px; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          h2 { margin: 0 0 16px; font-size: 20px; }
          p { line-height: 1.7; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 20px 0; }
          .item { padding: 14px; border-radius: 12px; background: #f8fafc; }
          .item small { display: block; color: #64748b; margin-bottom: 6px; }
          .note { margin-bottom: 18px; color: #2563eb; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="note">${heading}</div>
          <div class="card">
            <h1>${report.title}</h1>
            <div class="meta">${report.staffName} • ${report.position} • ${report.status} • ${report.time}</div>
            <div class="grid">
              <div class="item"><small>Report ID</small><strong>${report.id}</strong></div>
              <div class="item"><small>Position</small><strong>${report.position}</strong></div>
            </div>
            <h2>Report Detail</h2>
            <p>${report.detail}</p>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function AdminReportDetailPage() {
  const { reportId } = useParams();
  const { currentTime } = useOutletContext();

  const report = useMemo(
    () => staffReports.find((item) => item.id === reportId),
    [reportId],
  );

  if (!report) {
    return <Navigate to="/admin/report" replace />;
  }

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="admin-overview">
      <div className="admin-overview-head">
        <div>
          <div className="admin-staff-breadcrumbs">
            <Link to="/admin/report">Report</Link>
            <span>/</span>
            <strong>{report.id}</strong>
          </div>
          <h2>{report.title}</h2>
          <p>Report detail updated at {formattedTime}.</p>
        </div>
        <div className="admin-report-actions">
          <button type="button" className="admin-report-action-btn is-print" onClick={() => openReportPrint(report, "print")}>
            Print Paper
          </button>
          <button type="button" className="admin-report-action-btn is-pdf" onClick={() => openReportPrint(report, "pdf")}>
            Download PDF
          </button>
        </div>
      </div>

      <article className="admin-panel admin-report-detail-panel">
        <div className="admin-report-detail-head">
          <div className="admin-student-cell">
            <span className="avatar-tone-2">
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

        <div className="admin-report-detail-grid">
          <div className="admin-report-detail-item">
            <span>Report ID</span>
            <strong>{report.id}</strong>
          </div>
          <div className="admin-report-detail-item">
            <span>Submitted Time</span>
            <strong>{report.time}</strong>
          </div>
          <div className="admin-report-detail-item">
            <span>Position</span>
            <strong>{report.position}</strong>
          </div>
          <div className="admin-report-detail-item">
            <span>Status</span>
            <strong>{report.status}</strong>
          </div>
        </div>

        <div className="admin-report-detail-body">
          <h3>Full Report</h3>
          <p>{report.detail}</p>
          <small>For PDF download, click `Download PDF` and choose `Save as PDF` in the browser print dialog.</small>
        </div>
      </article>
    </section>
  );
}
