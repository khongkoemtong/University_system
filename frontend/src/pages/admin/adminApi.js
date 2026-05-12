const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const CLASS_NAMES = ["Science 4", "Science 3", "Math 2", "History 1"];
const OFFICE_NAMES = ["Admin Block A", "Admin Block B", "Student Affairs Hub", "Main Office"];

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function calculateAge(dob) {
  if (!dob) return null;

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function getAttendanceFromId(id) {
  const numericId = Number.parseInt(id, 10);

  if (Number.isNaN(numericId)) {
    return 92;
  }

  return 88 + (numericId % 11);
}

function getPerformanceFromAttendance(attendance) {
  if (attendance >= 95) return "Excellent";
  if (attendance >= 90) return "Good";
  return "Needs Support";
}

function getClassName(student, index) {
  if (student.class_name) return student.class_name;
  if (student.className) return student.className;

  const code = student.student_code || student.id || index;
  const numericCode = Number.parseInt(String(code).replace(/\D/g, ""), 10);
  const classIndex = Number.isNaN(numericCode) ? index % CLASS_NAMES.length : numericCode % CLASS_NAMES.length;

  return CLASS_NAMES[classIndex];
}

function getStaffStatus(id) {
  const statuses = ["On Duty", "Reviewing", "On Call", "Meeting"];
  const numericId = Number.parseInt(id, 10);

  if (Number.isNaN(numericId)) {
    return statuses[0];
  }

  return statuses[numericId % statuses.length];
}

function getOffice(position, index) {
  if (/registrar/i.test(position)) return "Admin Block A";
  if (/teacher|lecturer|professor|instructor/i.test(position)) return "Faculty Wing";
  if (/it/i.test(position)) return "Tech Room B";
  if (/account/i.test(position)) return "Finance Office";
  if (/student/i.test(position)) return "Student Affairs Hub";
  return OFFICE_NAMES[index % OFFICE_NAMES.length];
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body, token, headers = {} } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload.data;
}

export function mapStudentRecord(student, index = 0) {
  const attendance = student.attendance ?? getAttendanceFromId(student.id);
  const performance = student.performance || getPerformanceFromAttendance(attendance);
  const age = student.age ?? calculateAge(student.dob) ?? (16 + (index % 4));
  const defaultStatus = "Present";

  return {
    id: String(student.id),
    displayId: student.student_code || `STU-${String(student.id).padStart(4, "0")}`,
    classId: student.class_id != null ? String(student.class_id) : "",
    name: student.name || "Unknown Student",
    className: getClassName(student, index),
    age,
    gender: student.gender ? toTitleCase(student.gender) : "Not set",
    email: student.email || "No email",
    attendance,
    performance,
    phone: student.phone || "Not available",
    tel: student.phone || "Not available",
    dob: student.dob || null,
    address: student.address || "Not provided",
    status: student.status || defaultStatus,
    percent: student.percent ?? attendance,
    days: student.days ?? 20 + (index % 11),
    attendanceScore: student.attendanceScore ?? Number((attendance * 0.4).toFixed(1)),
    activityScore: student.activityScore ?? 15 + (index % 5),
    examScore: student.examScore ?? 30 + (index % 9),
  };
}

export function mapStaffRecord(member, index = 0) {
  const role = member.position || "Staff Member";

  return {
    id: String(member.id),
    userId: member.user_id != null ? String(member.user_id) : "",
    displayId: member.staff_code || `STF-${String(member.id).padStart(4, "0")}`,
    name: member.name || "Unknown Staff",
    role,
    roleSlug: slugify(role),
    gender: member.gender ? toTitleCase(member.gender) : "Not set",
    shift: member.shift || "08:00 - 16:00",
    status: member.status || getStaffStatus(member.id),
    phone: member.phone || "Not available",
    email: member.email || "No email",
    office: member.office || getOffice(role, index),
  };
}

export async function fetchStudents() {
  const students = await apiRequest("/students");
  return Array.isArray(students) ? students.map(mapStudentRecord) : [];
}

export async function fetchStaffMembers() {
  const staff = await apiRequest("/staff");
  return Array.isArray(staff) ? staff.map(mapStaffRecord) : [];
}

export function mapCourseRecord(course, index = 0) {
  const fallbackLead = course.position || "Unassigned";

  return {
    id: String(course.id),
    name: course.name || `Course ${index + 1}`,
    staffId: course.staff_id != null ? String(course.staff_id) : "",
    staffCode: course.staff_code || "Not assigned",
    position: fallbackLead,
    status: course.staff_id ? "Assigned" : "Awaiting Staff",
  };
}

export async function fetchCourses() {
  const courses = await apiRequest("/courses");
  return Array.isArray(courses) ? courses.map(mapCourseRecord) : [];
}

export function mapClassRecord(classroom, index = 0) {
  const maxStudents = Number.parseInt(classroom.max_students, 10);
  const studentCount = Number.parseInt(classroom.student_count, 10);
  const capacity = Number.isNaN(maxStudents) ? 30 : maxStudents;
  const enrolled = Number.isNaN(studentCount) ? 0 : studentCount;
  const slugSource = classroom.class_code || classroom.name || `class-${index + 1}`;

  return {
    id: String(classroom.id),
    name: classroom.name || `Class ${index + 1}`,
    classCode: classroom.class_code || `CLS-${String(classroom.id).padStart(2, "0")}`,
    slug: slugify(slugSource),
    maxStudents: capacity,
    studentCount: enrolled,
    openSeats: Math.max(capacity - enrolled, 0),
    status: enrolled >= capacity ? "Full" : enrolled === 0 ? "Empty" : "Open",
    teacherStaffId: classroom.teacher_staff_id != null ? String(classroom.teacher_staff_id) : "",
    teacherName: classroom.teacher_name || "",
    teacherEmail: classroom.teacher_email || "",
    teacherStaffCode: classroom.teacher_staff_code || "",
    teacherPosition: classroom.teacher_position || "",
    createdAt: classroom.created_at || null,
  };
}

export async function fetchClasses(token) {
  const classes = await apiRequest("/classes", { token });
  return Array.isArray(classes) ? classes.map(mapClassRecord) : [];
}

export async function fetchClassAttendance({ classId, date }, token) {
  return apiRequest(`/attendance/class?class_id=${encodeURIComponent(classId)}&date=${encodeURIComponent(date)}`, {
    token,
  });
}

export async function saveClassAttendance({ classId, date, entries }, token) {
  return apiRequest("/attendance/class", {
    method: "POST",
    token,
    body: {
      class_id: classId,
      date,
      entries,
    },
  });
}

export async function createClass(payload, token) {
  return apiRequest("/classes", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateClass(payload, token) {
  return apiRequest("/classes", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteClass(id, token) {
  return apiRequest("/classes", {
    method: "DELETE",
    token,
    body: { id },
  });
}

export async function createCourse(payload, token) {
  return apiRequest("/courses", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateCourse(payload, token) {
  return apiRequest("/courses", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteCourse(id, token) {
  return apiRequest("/courses", {
    method: "DELETE",
    token,
    body: { id },
  });
}

export async function fetchAdminDirectoryData() {
  const [students, staffMembers] = await Promise.all([fetchStudents(), fetchStaffMembers()]);

  return { students, staffMembers };
}

export async function fetchUsers(token) {
  return apiRequest("/users", { token });
}

export async function fetchRoles(token) {
  return apiRequest("/roles", { token });
}

export async function fetchPermissions(token) {
  return apiRequest("/permissions", { token });
}

export async function fetchPermissionsByRoleId(roleId, token) {
  return apiRequest(`/role_permissions?role_id=${roleId}`, { token });
}

export async function assignPermissionToRole({ roleId, permissionId }, token) {
  return apiRequest("/role_permissions/assign", {
    method: "POST",
    token,
    body: {
      role_id: roleId,
      permission_id: permissionId,
    },
  });
}

export async function updateRolePermission({ roleId, oldPermissionId, newPermissionId }, token) {
  return apiRequest("/role_permissions/update", {
    method: "PUT",
    token,
    body: {
      role_id: roleId,
      old_permission_id: oldPermissionId,
      new_permission_id: newPermissionId,
    },
  });
}

export async function removePermissionFromRole({ roleId, permissionId }, token) {
  return apiRequest("/role_permissions/remove", {
    method: "DELETE",
    token,
    body: {
      role_id: roleId,
      permission_id: permissionId,
    },
  });
}

function findRoleByName(roles, roleName) {
  const normalizedRoleName = String(roleName || "").trim().toLowerCase();
  return roles.find((role) => String(role.name || "").trim().toLowerCase() === normalizedRoleName) || null;
}

async function resolveRoleId(roleName, token) {
  const roles = await fetchRoles(token);
  const role = findRoleByName(roles, roleName);

  if (!role) {
    throw new Error(`Role "${roleName}" not found`);
  }

  return Number(role.id);
}

export async function createUser(payload, token) {
  return apiRequest("/users", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateUser(payload, token) {
  return apiRequest("/users", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteUser(id, token) {
  return apiRequest("/users", {
    method: "DELETE",
    token,
    body: { id },
  });
}

export async function createStaffProfile(payload, token) {
  return apiRequest("/staff", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateStaffProfile(payload, token) {
  return apiRequest("/staff", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteStaffProfile(id, token) {
  return apiRequest("/staff", {
    method: "DELETE",
    token,
    body: { id },
  });
}

export async function createAdminAccount(
  { name, email, password, roleId, permissions = [] },
  token,
) {
  const adminRoleId = roleId ?? await resolveRoleId("admin", token);
  const user = await createUser(
    {
      name,
      email,
      password,
      role_id: adminRoleId,
    },
    token,
  );

  for (const permissionId of permissions) {
    await assignPermissionToRole({ roleId: adminRoleId, permissionId }, token);
  }

  return user;
}

export async function updateAdminAccount(
  { id, name, email, roleId, permissionsToAdd = [], permissionsToRemove = [] },
  token,
) {
  const adminRoleId = roleId ?? await resolveRoleId("admin", token);
  const user = await updateUser(
    {
      id,
      name,
      email,
      role_id: adminRoleId,
    },
    token,
  );

  for (const permissionId of permissionsToAdd) {
    await assignPermissionToRole({ roleId: adminRoleId, permissionId }, token);
  }

  for (const permissionId of permissionsToRemove) {
    await removePermissionFromRole({ roleId: adminRoleId, permissionId }, token);
  }

  return user;
}

export async function deleteAdminAccount(id, token) {
  return deleteUser(id, token);
}

export async function createStaffAccount(
  { name, email, password, staffCode, position, roleId, permissions = [] },
  token,
) {
  const staffRoleId = roleId ?? await resolveRoleId("staff", token);
  const user = await createUser(
    {
      name,
      email,
      password,
      role_id: staffRoleId,
    },
    token,
  );

  const staff = await createStaffProfile(
    {
      user_id: user.id,
      staff_code: staffCode,
      position,
    },
    token,
  );

  for (const permissionId of permissions) {
    await assignPermissionToRole({ roleId: staffRoleId, permissionId }, token);
  }

  return { user, staff };
}

export async function updateStaffAccount(
  {
    userId,
    staffId,
    name,
    email,
    staffCode,
    position,
    roleId,
    permissionsToAdd = [],
    permissionsToRemove = [],
  },
  token,
) {
  const staffRoleId = roleId ?? await resolveRoleId("staff", token);
  const user = await updateUser(
    {
      id: userId,
      name,
      email,
      role_id: staffRoleId,
    },
    token,
  );

  const staff = await updateStaffProfile(
    {
      id: staffId,
      user_id: userId,
      staff_code: staffCode,
      position,
    },
    token,
  );

  for (const permissionId of permissionsToAdd) {
    await assignPermissionToRole({ roleId: staffRoleId, permissionId }, token);
  }

  for (const permissionId of permissionsToRemove) {
    await removePermissionFromRole({ roleId: staffRoleId, permissionId }, token);
  }

  return { user, staff };
}

export async function deleteStaffAccount({ userId, staffId, deleteUserAccount = true }, token) {
  if (staffId) {
    await deleteStaffProfile(staffId, token);
  }

  if (deleteUserAccount && userId) {
    return deleteUser(userId, token);
  }

  return { success: true };
}
