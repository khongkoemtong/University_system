import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

export default function StaffDashboard() {
  const { currentTime, filteredStudents, classes, dataLoading, dataError } = useOutletContext();

  const maleCount = filteredStudents.filter((student) => student.gender === "Male").length;
  const femaleCount = filteredStudents.filter((student) => student.gender === "Female").length;
  const totalCount = Math.max(maleCount + femaleCount, 1);
  const malePercent = Math.round((maleCount / totalCount) * 100);
  const femalePercent = 100 - malePercent;
  const nowLabel = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const absent = filteredStudents.filter((student) => student.status === "Absent").length;
    const late = filteredStudents.filter((student) => student.status === "Late").length;
    return [
      { label: "Total Classes", value: classes.length },
      { label: "Total Students", value: total },
      { label: "Absent Today", value: absent || 0 },
      { label: "Late Students", value: late || 0 },
    ];
  }, [classes.length, filteredStudents]);

  const attendanceSummary = useMemo(() => {
    const total = Math.max(filteredStudents.length, 1);
    const present = filteredStudents.filter((student) => student.status === "Present").length;
    const absent = filteredStudents.filter((student) => student.status === "Absent").length;
    const late = filteredStudents.filter((student) => student.status === "Late").length;

    return [
      {
        label: "Present",
        value: present,
        percent: Math.round((present / total) * 100),
        tone: "present",
      },
      {
        label: "Absent",
        value: absent,
        percent: Math.round((absent / total) * 100),
        tone: "absent",
      },
      {
        label: "Late",
        value: late,
        percent: Math.round((late / total) * 100),
        tone: "late",
      },
    ];
  }, [filteredStudents]);

  const classSummary = useMemo(() => {
    return classes.map((classItem) => ({
      name: classItem.name,
      room: classItem.classCode,
      value: filteredStudents.filter((student) => student.className === classItem.name).length,
    }));
  }, [classes, filteredStudents]);

  return (
    <section className="staff-page">
      <div className="staff-page-head">
        <div>
          <h2>Overview</h2>
          <p>Teacher attendance workspace updated at {nowLabel}.</p>
        </div>
        <div className="staff-status-pill">
          <span className="staff-live-dot" />
          {dataLoading ? "Loading classes" : dataError ? "Sync issue" : "Live attendance overview"}
        </div>
      </div>

      {dataError ? (
        <section className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>Data Sync Problem</h3>
              <p>{dataError}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="staff-stat-grid">
        {stats.map((stat, index) => (
          <article key={stat.label} className={`staff-stat-card${index === 1 ? " is-highlight" : ""}`}>
            <p>{stat.label}</p>
            <strong>{String(stat.value).padStart(2, "0")}</strong>
          </article>
        ))}
      </section>

      <section className="staff-panel-grid">
        <article className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>Today Attendance Percent</h3>
              <p>Real-time present, absent, and late percentages.</p>
            </div>
          </div>
          <div className="staff-attendance-percent">
            {attendanceSummary.map((item) => (
              <article key={item.label} className={`staff-attendance-percent-card is-${item.tone}`}>
                <div className="staff-attendance-percent-head">
                  <strong>{item.label}</strong>
                  <span>{item.value} students</span>
                </div>
                <div className="staff-attendance-percent-value">{item.percent}%</div>
                <div className="staff-attendance-percent-bar">
                  <span style={{ width: `${item.percent}%` }} />
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>Students by Class</h3>
              <p>Current student count for each class.</p>
            </div>
          </div>
          <div className="staff-bar-wrap">
            {classSummary.map((item) => (
              <div key={item.name} className="staff-bar-col">
                <div className="staff-bar is-active" style={{ height: `${Math.max(item.value, 1) * 28}px` }} />
                <strong className="staff-bar-value">{item.value}</strong>
                <span className="staff-muted">{item.name}</span>
                <span className="staff-bar-room">{item.room}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="staff-report-grid">
        <article className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>Students by Gender</h3>
              <p>Current filtered class mix</p>
            </div>
          </div>
          <div className="staff-gender">
            <div className="staff-gender-bubble is-male">{malePercent}%</div>
            <div className="staff-gender-bubble is-female">{femalePercent}%</div>
          </div>
          <div className="staff-legend">
            <span className="male">Male {maleCount}</span>
            <span className="female">Female {femaleCount}</span>
          </div>
        </article>

        <article className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>Top Attendants</h3>
              <p>Best attendance in selected period</p>
            </div>
          </div>
          <div className="staff-rank-list">
            {filteredStudents.slice(0, 6).map((student) => (
              <div key={student.name} className="staff-rank-item">
                <div className="staff-rank-left">
                  <div className="staff-mini-avatar">
                    {student.name.split(" ").map((part) => part[0]).join("")}
                  </div>
                  <div>
                    <strong>{student.name}</strong>
                    <p className="staff-rank-meta">{student.percent}%</p>
                  </div>
                </div>
                <div>
                  <div className="staff-progress">
                    <span style={{ width: `${student.percent}%` }} />
                  </div>
                  <p className="staff-rank-meta">{student.days} days</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="staff-content-panel">
          <div className="staff-content-panel-head">
            <div>
              <h3>Attendance Snapshot</h3>
              <p>Live count summary for the school day.</p>
            </div>
          </div>
          <div className="staff-snapshot-list">
            {attendanceSummary.map((item) => (
              <div key={item.label} className="staff-snapshot-item">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.value} students</p>
                </div>
                <span className={`staff-snapshot-badge is-${item.tone}`}>{item.percent}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
