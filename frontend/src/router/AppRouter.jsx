import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminReportDetailPage from "../pages/admin/AdminReportDetailPage";
import AdminSectionPage from "../pages/admin/AdminSectionPage";
import AdminStaffPage from "../pages/admin/AdminStaffPage";
import AdminStaffPositionPage from "../pages/admin/AdminStaffPositionPage";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffClassAttendancePage from "../pages/staff/StaffClassAttendancePage";
import StaffLayout from "../pages/staff/StaffLayout";
import StaffSectionPage from "../pages/staff/StaffSectionPage";
import UserDashboard from "../pages/user/UserDashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="messenger" element={<Navigate to="/admin/report" replace />} />
          <Route path="report" element={<AdminSectionPage />} />
          <Route path="report/:reportId" element={<AdminReportDetailPage />} />
          <Route path="calendar" element={<Navigate to="/admin/staff" replace />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="staff/:positionSlug" element={<AdminStaffPositionPage />} />
          <Route path="database" element={<AdminSectionPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}
