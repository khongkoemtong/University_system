export const staffNavItems = [
  { label: "Overview", to: "/staff/dashboard", icon: "grid" },
  { label: "Manage Attendance", to: "/staff/manage-attendance", icon: "check" },
  { label: "Reports", to: "/staff/reports", icon: "chart" },
];

export const classCatalog = [
  {
    name: "Science 4",
    slug: "science-4",
    type: "Physical Class",
    schedule: "Mon & Thu (08:00 AM - 09:30 AM)",
    createdAt: "2026-04-22 01:39:13",
    instructor: "Chris Tan",
    room: "Lab A-4",
  },
  {
    name: "Math 2",
    slug: "math-2",
    type: "Physical Class",
    schedule: "Tue & Fri (10:15 AM - 11:45 AM)",
    createdAt: "2026-04-20 09:15:00",
    instructor: "Chris Tan",
    room: "Room B-2",
  },
  {
    name: "History 1",
    slug: "history-1",
    type: "Physical Class",
    schedule: "Wed & Sat (01:30 PM - 03:00 PM)",
    createdAt: "2026-04-18 02:25:00",
    instructor: "Chris Tan",
    room: "Room C-1",
  },
];

export const baseStudents = [
  {
    id: "3050",
    name: "Brooklyn Simmons",
    className: "Science 4",
    gender: "Male",
    tel: "010421015",
    percent: 100,
    days: 30,
    status: "Present",
    attendanceScore: 39.5,
    activityScore: 18,
    examScore: 37,
  },
  {
    id: "3048",
    name: "Cody Fisher",
    className: "Science 4",
    gender: "Male",
    tel: "0976295656",
    percent: 100,
    days: 30,
    status: "Present",
    attendanceScore: 38.8,
    activityScore: 17.5,
    examScore: 35,
  },
  {
    id: "3047",
    name: "Marvin McKinney",
    className: "Math 2",
    gender: "Male",
    tel: "012778809",
    percent: 98.7,
    days: 29,
    status: "Late",
    attendanceScore: 36.5,
    activityScore: 16,
    examScore: 34,
  },
  {
    id: "3046",
    name: "Arlene McCoy",
    className: "History 1",
    gender: "Female",
    tel: "015500321",
    percent: 97,
    days: 28,
    status: "Present",
    attendanceScore: 39.1,
    activityScore: 19,
    examScore: 36,
  },
  {
    id: "3045",
    name: "Kristin Watson",
    className: "Science 4",
    gender: "Female",
    tel: "086220145",
    percent: 95.6,
    days: 26,
    status: "Absent",
    attendanceScore: 31.2,
    activityScore: 15,
    examScore: 33,
  },
  {
    id: "3044",
    name: "Savannah Nguyen",
    className: "Math 2",
    gender: "Female",
    tel: "098611220",
    percent: 94,
    days: 25,
    status: "Present",
    attendanceScore: 37.3,
    activityScore: 18.5,
    examScore: 35.5,
  },
];

export const attendanceSeries = [42, 45, 45.3, 42.1, 44.6, 45, 44.4, 44.8, 45.2, 47.1, 45.8, 43.5];

export const classBreakdown = [
  { name: "I", value: 17 },
  { name: "II", value: 18 },
  { name: "III", value: 16.8 },
  { name: "IV", value: 17.5 },
  { name: "V", value: 20 },
  { name: "VI", value: 15.9, active: true },
  { name: "VII", value: 19.4 },
  { name: "VIII", value: 18.1 },
];

export const weeklyAbsentBase = [3, 5, 8, 2, 4, 6, 1];

export const scheduleItems = [
  { title: "Science 4 Attendance", time: "08:00 AM", tone: "green" },
  { title: "Math 2 Homeroom", time: "10:15 AM", tone: "blue" },
  { title: "Guardian Follow-up", time: "01:30 PM", tone: "yellow" },
  { title: "Weekly Report Export", time: "03:45 PM", tone: "slate" },
];
