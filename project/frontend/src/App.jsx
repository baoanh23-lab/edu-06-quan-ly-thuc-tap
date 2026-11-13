
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import LecturerDashboard from "./lecturer/LecturerDashboard";
import StudentDashboard from "./student/StudentDashboard";
import EnterpriseDashboard from "./enterprise/EnterpriseDashboard";

// ========================================
// KIỂM TRA QUYỀN GIẢNG VIÊN
// ========================================

function LecturerRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.vaiTro !== "GIANG_VIEN") {
    if (user.vaiTro === "SINH_VIEN") {
      return <Navigate to="/sinh-vien" replace />;
    }

    if (user.vaiTro === "DOANH_NGHIEP") {
      return <Navigate to="/doanh-nghiep" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

// ========================================
// KIỂM TRA QUYỀN SINH VIÊN
// ========================================

function StudentRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.vaiTro !== "SINH_VIEN") {
    if (user.vaiTro === "GIANG_VIEN") {
      return <Navigate to="/giang-vien" replace />;
    }

    if (user.vaiTro === "DOANH_NGHIEP") {
      return <Navigate to="/doanh-nghiep" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

// ========================================
// KIỂM TRA QUYỀN DOANH NGHIỆP
// ========================================

function EnterpriseRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.vaiTro !== "DOANH_NGHIEP") {
    if (user.vaiTro === "SINH_VIEN") {
      return <Navigate to="/sinh-vien" replace />;
    }

    if (user.vaiTro === "GIANG_VIEN") {
      return <Navigate to="/giang-vien" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

// ========================================
// ỨNG DỤNG CHÍNH
// ========================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Trang mặc định */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Đăng nhập */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Giao diện giảng viên */}
        <Route
          path="/giang-vien"
          element={
            <LecturerRoute>
              <LecturerDashboard />
            </LecturerRoute>
          }
        />

        {/* Giao diện sinh viên */}
        <Route
          path="/sinh-vien"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />

        {/* Giao diện doanh nghiệp */}
        <Route
          path="/doanh-nghiep"
          element={
            <EnterpriseRoute>
              <EnterpriseDashboard />
            </EnterpriseRoute>
          }
        />

        {/* Đường dẫn không tồn tại */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
