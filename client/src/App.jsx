import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StudentDashboard from "./pages/StudentDashboard";
import DocumentVaultPage from "./pages/DocumentVaultPage";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UnauthorizedPage from "./pages/UnauthorizedPage";

const DashboardResolver = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "student") return <StudentDashboard />;
  if (user.role === "admin") return <AdminDashboard />;
  return <AuthorityDashboard />;
};

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardResolver />
        </ProtectedRoute>
      }
    />
    <Route
      path="/student/document-vault"
      element={
        <ProtectedRoute roles={["student"]}>
          <DocumentVaultPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
