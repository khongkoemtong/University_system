import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminClassesPage from "../pages/admin/AdminClassesPage";
import AdminCoursesPage from "../pages/admin/AdminCoursesPage";
import AdminDatabaseStaffDetailPage from "../pages/admin/AdminDatabaseStaffDetailPage";
import AdminDatabaseStudentDetailPage from "../pages/admin/AdminDatabaseStudentDetailPage";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminReportDetailPage from "../pages/admin/AdminReportDetailPage";
import AdminSectionPage from "../pages/admin/AdminSectionPage";
import AdminStudentClassPage from "../pages/admin/AdminStudentClassPage";
import AdminStaffPage from "../pages/admin/AdminStaffPage";
import AdminStaffPositionPage from "../pages/admin/AdminStaffPositionPage";
import AdminStudentsPage from "../pages/admin/AdminStudentsPage";
import AuthSignInPage from "../pages/auth/AuthSignInPage";
import AuthStudentSignUpPage from "../pages/auth/AuthStudentSignUpPage";
import AuthSignUpPage from "../pages/auth/AuthSignUpPage";
import NotFoundPage from "../pages/NotFoundPage";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffClassAttendancePage from "../pages/staff/StaffClassAttendancePage";
import StaffLayout from "../pages/staff/StaffLayout";
import StaffSectionPage from "../pages/staff/StaffSectionPage";
import UserDashboard from "../pages/user/UserDashboard";

function RootRedirect() {
  const location = useLocation();
  const requestedPath = new URLSearchParams(location.search).get("redirect");
  const hashPath = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
  const candidatePath = hashPath || requestedPath;
  const targetPath = candidatePath && candidatePath.startsWith("/") ? candidatePath : "/sign-in";

  return <Navigate to={targetPath} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/sign-in" element={<AuthSignInPage />} />
        <Route path="/sign-up" element={<AuthSignUpPage />} />
        <Route path="/student-sign-up" element={<AuthStudentSignUpPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="messenger" element={<Navigate to="/admin/report" replace />} />
          <Route path="report" element={<AdminSectionPage />} />
          <Route path="report/:reportId" element={<AdminReportDetailPage />} />
          <Route path="calendar" element={<Navigate to="/admin/staff" replace />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="students/:classSlug" element={<AdminStudentClassPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="staff/:positionSlug" element={<AdminStaffPositionPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="database" element={<AdminSectionPage />} />
          <Route path="database/student/:studentId" element={<AdminDatabaseStudentDetailPage />} />
          <Route path="database/staff/:staffId" element={<AdminDatabaseStaffDetailPage />} />
          <Route path="attendance" element={<AdminSectionPage />} />
          <Route path="settings" element={<AdminSectionPage />} />
        </Route>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="manage-attendance" element={<StaffSectionPage />} />
          <Route path="manage-attendance/:classSlug" element={<StaffClassAttendancePage />} />
          <Route path="students" element={<StaffSectionPage />} />
          <Route path="reports" element={<StaffSectionPage />} />
        </Route>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
