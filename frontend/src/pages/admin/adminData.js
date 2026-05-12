export const adminNavItems = [
  { label: "Dashboard", icon: "grid", to: "/admin/dashboard" },
  { label: "Report", icon: "message", to: "/admin/report", badge: 3 },
  { label: "Staff", icon: "staff", to: "/admin/staff" },
  { label: "Classes", icon: "classroom", to: "/admin/classes" },
  { label: "Courses", icon: "course", to: "/admin/courses" },
  { label: "Database", icon: "file", to: "/admin/database" },
  { label: "Attendance", icon: "chart", to: "/admin/attendance" },
  { label: "Settings", icon: "gear", to: "/admin/settings" },
];

export const students = [
  {
    name: "Ken Khoi",
    id: "SC400122",
    className: "Science 4",
    age: 17,
    gender: "Male",
    email: "kkhoi@gmail.com",
    attendance: 96,
    performance: "Excellent",
  },
  {
    name: "Zach Sween",
    id: "SC400123",
    className: "Science 4",
    age: 18,
    gender: "Male",
    email: "zsween@gmail.com",
    attendance: 91,
    performance: "Good",
  },
  {
    name: "Mia Collins",
    id: "SC400124",
    className: "Science 3",
    age: 17,
    gender: "Female",
    email: "miacollins@gmail.com",
    attendance: 98,
    performance: "Excellent",
  },
  {
    name: "Lina Park",
    id: "SC400125",
    className: "Math 2",
    age: 16,
    gender: "Female",
    email: "linapark@gmail.com",
    attendance: 88,
    performance: "Good",
  },
];

export const teachers = [
  { name: "Amanda Lee", subject: "Physics", room: "B-204", status: "Available" },
  { name: "James Carter", subject: "Biology", room: "A-104", status: "In Class" },
  { name: "Sok Dara", subject: "History", room: "C-302", status: "Meeting" },
];

export const staffMembers = [
  {
    id: "STF-1001",
    name: "Nina Roberts",
    role: "Registrar",
    roleSlug: "registrar",
    gender: "Female",
    shift: "08:00 - 16:00",
    status: "On Duty",
    phone: "010-224-100",
    email: "nina.roberts@school.edu",
    office: "Admin Block A",
  },
  {
    id: "STF-1002",
    name: "Mara Lin",
    role: "Registrar",
    roleSlug: "registrar",
    gender: "Female",
    shift: "08:30 - 16:30",
    status: "Reviewing",
    phone: "010-224-101",
    email: "mara.lin@school.edu",
    office: "Admin Block A",
  },
  {
    id: "STF-1003",
    name: "David Chen",
    role: "IT Support",
    roleSlug: "it-support",
    gender: "Male",
    shift: "09:00 - 17:00",
    status: "On Call",
    phone: "010-224-110",
    email: "david.chen@school.edu",
    office: "Tech Room B",
  },
  {
    id: "STF-1004",
    name: "Kosal Vann",
    role: "IT Support",
    roleSlug: "it-support",
    gender: "Male",
    shift: "07:30 - 15:30",
    status: "On Duty",
    phone: "010-224-111",
    email: "kosal.vann@school.edu",
    office: "Tech Room B",
  },
  {
    id: "STF-1005",
    name: "Sophia Kim",
    role: "Accounting",
    roleSlug: "accounting",
    gender: "Female",
    shift: "08:30 - 16:30",
    status: "Reviewing",
    phone: "010-224-120",
    email: "sophia.kim@school.edu",
    office: "Finance Office",
  },
  {
    id: "STF-1006",
    name: "Liam Foster",
    role: "Accounting",
    roleSlug: "accounting",
    gender: "Male",
    shift: "08:00 - 16:00",
    status: "On Duty",
    phone: "010-224-121",
    email: "liam.foster@school.edu",
    office: "Finance Office",
  },
  {
    id: "STF-1007",
    name: "Sara Nhem",
    role: "Student Affairs",
    roleSlug: "student-affairs",
    gender: "Female",
    shift: "08:00 - 16:00",
    status: "Meeting",
    phone: "010-224-130",
    email: "sara.nhem@school.edu",
    office: "Student Affairs Hub",
  },
  {
    id: "STF-1008",
    name: "Michael Ross",
    role: "Student Affairs",
    roleSlug: "student-affairs",
    gender: "Male",
    shift: "09:00 - 17:00",
    status: "On Duty",
    phone: "010-224-131",
    email: "michael.ross@school.edu",
    office: "Student Affairs Hub",
  },
];

export const staffPositions = [
  { slug: "registrar", name: "Registrar", type: "Administration Desk" },
  { slug: "it-support", name: "IT Support", type: "Technical Operations" },
  { slug: "accounting", name: "Accounting", type: "Finance Office" },
  { slug: "student-affairs", name: "Student Affairs", type: "Student Services" },
];

export const scheduleItems = [
  {
    title: "Review Annual Report",
    time: "1:00 PM",
    date: "Today",
    icon: "📝",
    tone: "paper",
  },
  {
    title: "Soccer Competition",
    time: "8:00 AM",
    date: "Tomorrow",
    icon: "⚽",
    tone: "field",
  },
  {
    title: "Monthly Meeting",
    time: "3:00 PM",
    date: "Wednesday",
    icon: "📌",
    tone: "mint",
  },
  {
    title: "School President Election",
    time: "10:00 AM",
    date: "Friday",
    icon: "🎯",
    tone: "silver",
  },
];

export const attendanceTrend = [42, 38, 51, 55, 88, 94, 81, 77, 29, 39, 56, 68, 71, 66, 87, 59, 48];

export const productivity = [
  { month: "Mar", value: 24, tone: "soft" },
  { month: "Apr", value: 37, tone: "strong" },
  { month: "May", value: 29, tone: "soft" },
  { month: "Jun", value: 15, tone: "soft" },
];

export const announcements = [
  { title: "System sync completed", detail: "Student records synced 2 minutes ago." },
  { title: "Library renewal reminder", detail: "42 renewals require approval today." },
  { title: "Transport request updated", detail: "3 route adjustments were submitted this hour." },
];

export const staffReports = [
  {
    id: "REP-2001",
    staffName: "Nina Roberts",
    position: "Registrar",
    title: "Student Record Update",
    detail: "Completed semester registration review and flagged 6 records for missing guardian signatures.",
    time: "08:40 AM",
    status: "Submitted",
  },
  {
    id: "REP-2002",
    staffName: "David Chen",
    position: "IT Support",
    title: "Network Maintenance",
    detail: "Resolved lab network slowdown and updated access point firmware for Block B classrooms.",
    time: "09:25 AM",
    status: "In Review",
  },
  {
    id: "REP-2003",
    staffName: "Sophia Kim",
    position: "Accounting",
    title: "Fee Collection Summary",
    detail: "Prepared daily payment report with 14 cleared invoices and 2 balances pending approval.",
    time: "10:15 AM",
    status: "Submitted",
  },
  {
    id: "REP-2004",
    staffName: "Sara Nhem",
    position: "Student Affairs",
    title: "Counseling Follow-up",
    detail: "Documented parent meeting outcomes and scheduled 3 support follow-ups for this week.",
    time: "11:05 AM",
    status: "Pending",
  },
];

export const quickStatsBase = [
  { label: "Students", value: 302, tone: "green", icon: "student", delta: "+12 this week" },
  { label: "Teachers", value: 33, tone: "yellow", icon: "teacher", delta: "+2 new hires" },
  { label: "Staff", value: 28, tone: "blue", icon: "staff", delta: "94% active today" },
];
