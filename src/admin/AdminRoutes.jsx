import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Approvals from "./pages/Approvals";
import Books from "./pages/Books";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import SystemMonitor from "./pages/SystemMonitor";
import TopReaders from "./pages/TopReaders";
import Users from "./pages/Users";
import Login from "../auth/pages/Login";
import Register from "../auth/pages/Register";
import UserDashboard from "../auth/pages/UserDashboard";
import {
  getInternalUserPortalPath,
  getHomePathByRole,
  getRoleName,
  isExternalUserPortal,
  USER_PORTAL_URL,
} from "../auth/roleUtils";

function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}

export default function AdminRoutes() {
  const { isAuthenticated, isReady, user } = useAuth();
  const roleName = getRoleName(user?.role);
  const homePath = isAuthenticated ? getHomePathByRole(user?.role) : "/login";
  const userPortalPath = getInternalUserPortalPath() || "/user/dashboard";
  const useExternalUserPortal = isExternalUserPortal();

  if (!isReady) {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          isAuthenticated && roleName === "User" && useExternalUserPortal ? (
            <ExternalRedirect to={USER_PORTAL_URL} />
          ) : (
            <Navigate to={homePath} replace />
          )
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            {roleName === "User" && useExternalUserPortal ? (
              <ExternalRedirect to={USER_PORTAL_URL} />
            ) : (
              <UserDashboard />
            )}
          </ProtectedRoute>
        }
      />
      {userPortalPath !== "/user/dashboard" && (
        <Route
          path={userPortalPath}
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      )}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="categories" element={<Categories />} />
        <Route path="books" element={<Books />} />
        <Route path="readers" element={<TopReaders />} />
        <Route path="monitor" element={<SystemMonitor />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
