
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BookOpen,
  FileCheck,
  FileText,
  UserRound,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Bell,
  Building2,
  Clock3,
  ChevronRight,
  Award,
} from "lucide-react";

import "../styles/Student.css";
import api from "../services/api";

import InternshipRegistration from "./InternshipRegistration";
import LecturerRegistration from "./LecturerRegistration";
import InternshipProcess from "./InternshipProcess";
import InternshipJournal from "./InternshipJournal";
import InternshipEvidence from "./InternshipEvidence";
import InternshipReport from "./InternshipReport";
import StudentResult from "./StudentResult";

// =====================================================
// MENU SINH VIÊN
// =====================================================

const menuItems = [
  { name: "Tổng quan", icon: LayoutDashboard },
  { name: "Đăng ký giảng viên hướng dẫn", icon: GraduationCap },
  { name: "Đăng ký thực tập", icon: ClipboardList },
  { name: "Quá trình thực tập", icon: CalendarDays },
  { name: "Nhật ký thực tập", icon: BookOpen },
  { name: "Minh chứng thực tập", icon: FileCheck },
  { name: "Báo cáo thực tập", icon: FileText },
  { name: "Kết quả thực tập", icon: Award },
  { name: "Tài khoản cá nhân", icon: UserRound },
];

const pageTitles = {
  "Tổng quan": "Tổng quan",
  "Đăng ký giảng viên hướng dẫn": "Đăng ký giảng viên hướng dẫn",
  "Đăng ký thực tập": "Đăng ký thực tập",
  "Quá trình thực tập": "Quá trình thực tập",
  "Nhật ký thực tập": "Nhật ký thực tập",
  "Minh chứng thực tập": "Minh chứng thực tập",
  "Báo cáo thực tập": "Báo cáo thực tập",
  "Kết quả thực tập": "Kết quả thực tập",
  "Tài khoản cá nhân": "Tài khoản cá nhân",
};

// =====================================================
// HÀM HỖ TRỢ
// =====================================================

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getField(object, ...keys) {
  for (const key of keys) {
    if (
      object?.[key] !== undefined &&
      object?.[key] !== null
    ) {
      return object[key];
    }
  }

  return null;
}

function formatStatus(status) {
  if (!status) return "Chưa cập nhật";

  return String(status).replaceAll("_", " ");
}

function formatDate(date) {
  if (!date) return "Chưa cập nhật";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("vi-VN");
}

// =====================================================
// TRANG TỔNG QUAN
// =====================================================

function DashboardHome({ onNavigate, studentName }) {
  const [loading, setLoading] = useState(true);

  const [registrations, setRegistrations] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [journals, setJournals] = useState([]);
  const [evidenceCount, setEvidenceCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  // ---------------------------------------------------
  // LẤY DỮ LIỆU TỔNG QUAN
  // ---------------------------------------------------

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [
        registrationResult,
        processResult,
        journalResult,
      ] = await Promise.allSettled([
        api.get("/api/dang-ky-thuc-tap/cua-toi"),
        api.get("/api/qua-trinh-thuc-tap/cua-toi"),
        api.get("/api/nhat-ky/cua-toi"),
      ]);

      const registrationData =
        registrationResult.status === "fulfilled"
          ? getList(registrationResult.value.data)
          : [];

      const processData =
        processResult.status === "fulfilled"
          ? getList(processResult.value.data)
          : [];

      const journalData =
        journalResult.status === "fulfilled"
          ? getList(journalResult.value.data)
          : [];

      setRegistrations(registrationData);
      setProcesses(processData);
      setJournals(journalData);

      // Lấy tổng số minh chứng theo từng nhật ký
      if (journalData.length > 0) {
        const evidenceResults = await Promise.allSettled(
          journalData.map((journal) => {
            const maNhatKy = getField(
              journal,
              "maNhatKy",
              "MaNhatKy"
            );

            if (!maNhatKy) {
              return Promise.resolve({ data: [] });
            }

            return api.get(
              `/api/minh-chung/nhat-ky/${maNhatKy}`
            );
          })
        );

        const totalEvidence = evidenceResults.reduce(
          (total, result) => {
            if (result.status !== "fulfilled") {
              return total;
            }

            return (
              total +
              getList(result.value.data).length
            );
          },
          0
        );

        setEvidenceCount(totalEvidence);
      } else {
        setEvidenceCount(0);
      }
    } catch (error) {
      console.error("Lỗi tải tổng quan:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // DỮ LIỆU HIỂN THỊ
  // ---------------------------------------------------

  const latestRegistration = registrations[0] || null;
  const latestProcess = processes[0] || null;

  const registrationStatus = latestRegistration
    ? formatStatus(
        getField(
          latestRegistration,
          "trangThai",
          "trangThaiTong",
          "status"
        )
      )
    : "Chưa đăng ký";

  const progress = latestProcess
    ? getField(
        latestProcess,
        "tienDo",
        "phanTramTienDo",
        "progress"
      )
    : null;

  const progressText =
    progress !== null
      ? typeof progress === "number"
        ? `${progress}%`
        : String(progress)
      : latestProcess
        ? formatStatus(
            getField(latestProcess, "trangThai", "status")
          )
        : "Chưa bắt đầu";

  const processStatus = latestProcess
    ? formatStatus(
        getField(latestProcess, "trangThai", "status")
      )
    : "Chưa có quá trình";

  const companyName = latestProcess
    ? getField(
        latestProcess,
        "tenDoanhNghiep",
        "tenCongTy",
        "tenDn"
      )
    : null;

  const positionName = latestProcess
    ? getField(
        latestProcess,
        "tenViTri",
        "tenViTriThucTap",
        "viTri"
      )
    : null;

  const startDate = latestProcess
    ? getField(latestProcess, "ngayBatDau")
    : null;

  const endDate = latestProcess
    ? getField(latestProcess, "ngayKetThuc")
    : null;

  // ---------------------------------------------------
  // CHỨC NĂNG NHANH
  // ---------------------------------------------------

  const quickFunctions = [
    {
      title: "Đăng ký giảng viên hướng dẫn",
      description: "Lựa chọn giảng viên hướng dẫn thực tập",
      icon: GraduationCap,
    },
    {
      title: "Đăng ký thực tập",
      description: "Tìm kiếm và đăng ký vị trí thực tập",
      icon: ClipboardList,
    },
    {
      title: "Nhật ký thực tập",
      description: "Ghi nhận hoạt động thực tập",
      icon: BookOpen,
    },
    {
      title: "Nộp minh chứng",
      description: "Quản lý tài liệu minh chứng",
      icon: FileCheck,
    },
    {
      title: "Kết quả thực tập",
      description: "Theo dõi kết quả đánh giá cuối cùng",
      icon: Award,
    },
  ];

  return (
    <div className="student-dashboard">

      {/* CHÀO MỪNG */}

      <section className="student-welcome">
        <div>
          <span className="student-welcome-label">
            CỔNG QUẢN LÝ THỰC TẬP
          </span>

          <h1>Xin chào, {studentName}!</h1>

          <p>
            Chào mừng bạn đến với hệ thống quản lý thực tập
            và đánh giá doanh nghiệp.
          </p>
        </div>

        <div className="student-welcome-icon">
          <GraduationCap size={90} />
        </div>
      </section>

      {/* THỐNG KÊ */}

      <div className="student-section-heading">
        <div>
          <h3>Tổng quan thực tập</h3>
          <p>Theo dõi các thông tin thực tập của bạn.</p>
        </div>

        <button
          className="student-dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      <section className="student-statistics">

        <div className="student-stat-card">
          <div className="student-stat-icon blue">
            <Building2 size={23} />
          </div>

          <div>
            <span>Đăng ký thực tập</span>
            <h2>
              {loading ? "--" : registrations.length}
            </h2>
            <p>
              {loading ? "Đang tải..." : registrationStatus}
            </p>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon green">
            <Clock3 size={23} />
          </div>

          <div>
            <span>Tiến độ thực tập</span>
            <h2>
              {loading ? "--" : progressText}
            </h2>
            <p>
              {loading ? "Đang tải..." : processStatus}
            </p>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon orange">
            <BookOpen size={23} />
          </div>

          <div>
            <span>Nhật ký thực tập</span>
            <h2>
              {loading ? "--" : journals.length}
            </h2>
            <p>Số nhật ký đã ghi</p>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon purple">
            <FileCheck size={23} />
          </div>

          <div>
            <span>Minh chứng</span>
            <h2>
              {loading ? "--" : evidenceCount}
            </h2>
            <p>Số minh chứng đã nộp</p>
          </div>
        </div>

      </section>

      {/* CHỨC NĂNG NHANH */}

      <div className="student-section-heading">
        <div>
          <h3>Chức năng nhanh</h3>
          <p>Truy cập nhanh các chức năng thường dùng.</p>
        </div>
      </div>

      <section className="student-function-grid">
        {quickFunctions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="student-function-card"
              key={item.title}
              onClick={() =>
                onNavigate(
                  item.title === "Nộp minh chứng"
                    ? "Minh chứng thực tập"
                    : item.title
                )
              }
            >
              <div className="student-function-icon">
                <Icon size={23} />
              </div>

              <div className="student-function-text">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>

              <ChevronRight size={19} />
            </button>
          );
        })}
      </section>

      {/* THÔNG TIN THỰC TẬP */}

      <section className="student-bottom-panel">

        <div className="student-panel-heading">
          <div>
            <h3>Thông tin thực tập</h3>
            <p>
              Thông tin đăng ký và tình trạng thực tập của bạn.
            </p>
          </div>

          <Bell size={21} />
        </div>

        {loading ? (
          <div className="student-empty-state">
            Đang tải thông tin thực tập...
          </div>
        ) : latestProcess ? (
          <div className="student-dashboard-process">

            <div className="student-dashboard-process-grid">

              <div>
                <span>Doanh nghiệp</span>
                <strong>
                  {companyName || "Chưa cập nhật"}
                </strong>
              </div>

              <div>
                <span>Vị trí thực tập</span>
                <strong>
                  {positionName || "Chưa cập nhật"}
                </strong>
              </div>

              <div>
                <span>Ngày bắt đầu</span>
                <strong>{formatDate(startDate)}</strong>
              </div>

              <div>
                <span>Ngày kết thúc</span>
                <strong>{formatDate(endDate)}</strong>
              </div>

              <div>
                <span>Trạng thái quá trình</span>
                <strong>{processStatus}</strong>
              </div>

              <div>
                <span>Tiến độ</span>
                <strong>{progressText}</strong>
              </div>

            </div>

            <button
              className="student-dashboard-detail"
              onClick={() => onNavigate("Quá trình thực tập")}
            >
              Xem quá trình thực tập
              <ChevronRight size={17} />
            </button>
          </div>
        ) : latestRegistration ? (
          <div className="student-empty-state">

            <div className="student-empty-icon">
              <Clock3 size={28} />
            </div>

            <strong>Đơn đăng ký đang được xử lý</strong>

            <span>
              Trạng thái đăng ký: {registrationStatus}.
              Thông tin quá trình sẽ xuất hiện sau khi đủ điều kiện xác nhận.
            </span>

            <button
              className="student-dashboard-detail"
              onClick={() => onNavigate("Đăng ký thực tập")}
            >
              Xem đăng ký thực tập
              <ChevronRight size={17} />
            </button>

          </div>
        ) : (
          <div className="student-empty-state">

            <div className="student-empty-icon">
              <ClipboardList size={28} />
            </div>

            <strong>Chưa có thông tin thực tập</strong>

            <span>
              Thông tin sẽ được cập nhật sau khi bạn đăng ký
              và được xác nhận thực tập.
            </span>

            <button
              className="student-dashboard-detail"
              onClick={() => onNavigate("Đăng ký thực tập")}
            >
              Đăng ký thực tập ngay
              <ChevronRight size={17} />
            </button>

          </div>
        )}

      </section>
    </div>
  );
}

// =====================================================
// TRANG ĐANG PHÁT TRIỂN
// =====================================================

function ComingSoon({ title }) {
  return (
    <div className="student-placeholder">
      <div className="student-placeholder-icon">
        <GraduationCap size={40} />
      </div>

      <h2>{title}</h2>

      <p>
        Chức năng này sẽ được xây dựng trong giai đoạn tiếp theo.
      </p>
    </div>
  );
}

// =====================================================
// THÔNG TIN CÁ NHÂN
// =====================================================

function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/sinh-vien/ho-so");

      setStudent(response.data);
    } catch (err) {
      console.error("Lỗi lấy hồ sơ:", err);

      if (err.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền truy cập hồ sơ này.");
      } else if (err.response?.status === 404) {
        setError("Không tìm thấy hồ sơ sinh viên.");
      } else {
        setError("Không thể tải hồ sơ. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="student-profile-message">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-profile-message">
        <p>{error}</p>

        <button
          className="student-profile-retry"
          onClick={loadProfile}
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-profile-message">
        Không có dữ liệu hồ sơ sinh viên.
      </div>
    );
  }

  const fields = [
    { label: "Mã sinh viên", value: student.maSv },
    { label: "Họ và tên", value: student.hoTen },
    { label: "Email", value: student.email },
    { label: "Số điện thoại", value: student.soDienThoai },
    {
      label: "Chuyên ngành",
      value: student.chuyenNganh?.tenChuyenNganh,
    },
  ];

  return (
    <div className="student-profile">

      <section className="student-profile-banner">
        <div className="student-profile-avatar">
          <UserRound size={42} />
        </div>

        <div>
          <span>THÔNG TIN CÁ NHÂN</span>
          <h2>{student.hoTen}</h2>
          <p>Sinh viên · {student.maSv}</p>
        </div>
      </section>

      <section className="student-profile-card">

        <div className="student-profile-heading">
          <div>
            <h3>Thông tin hồ sơ</h3>
            <p>Thông tin cá nhân được lưu trong hệ thống.</p>
          </div>
        </div>

        <div className="student-profile-grid">
          {fields.map((field) => (
            <div
              className="student-profile-field"
              key={field.label}
            >
              <span>{field.label}</span>
              <strong>
                {field.value || "Chưa cập nhật"}
              </strong>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}

// =====================================================
// DASHBOARD SINH VIÊN
// =====================================================

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("Tổng quan");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const studentName =
    user.hoTen ||
    user.tenSinhVien ||
    user.username ||
    "Sinh viên";

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // ---------------------------------------------------
  // ĐIỀU HƯỚNG NỘI DUNG
  // ---------------------------------------------------

  const renderContent = () => {
    if (currentPage === "Tổng quan") {
      return (
        <DashboardHome
          onNavigate={handleNavigate}
          studentName={studentName}
        />
      );
    }

    if (currentPage === "Đăng ký giảng viên hướng dẫn") {
      return <LecturerRegistration />;
    }

    if (currentPage === "Đăng ký thực tập") {
      return <InternshipRegistration />;
    }

    if (currentPage === "Quá trình thực tập") {
      return <InternshipProcess />;
    }

    if (currentPage === "Nhật ký thực tập") {
      return <InternshipJournal />;
    }

    if (currentPage === "Minh chứng thực tập") {
      return <InternshipEvidence />;
    }

    if (currentPage === "Báo cáo thực tập") {
      return <InternshipReport />;
    }

    if (currentPage === "Kết quả thực tập") {
      return <StudentResult />;
    }

    if (currentPage === "Tài khoản cá nhân") {
      return <StudentProfile />;
    }

    return <ComingSoon title={pageTitles[currentPage]} />;
  };

  return (
    <div className="student-layout">

      {/* OVERLAY MOBILE */}

      {sidebarOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`student-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        <div className="student-brand">

          <div className="student-brand-icon">
            <GraduationCap size={27} />
          </div>

          <div>
            <h2>EDU-06</h2>
            <span>STUDENT PORTAL</span>
          </div>

          <button
            className="student-close-menu"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={21} />
          </button>

        </div>

        <p className="student-menu-title">
          MENU SINH VIÊN
        </p>

        <nav className="student-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`student-menu-item ${
                  currentPage === item.name ? "active" : ""
                }`}
                onClick={() => handleNavigate(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* THÔNG TIN NGƯỜI DÙNG */}

        <div className="student-sidebar-bottom">

          <div className="student-user">

            <div className="student-avatar">
              {studentName.charAt(0).toUpperCase()}
            </div>

            <div className="student-user-info">
              <strong>{studentName}</strong>
              <span>Sinh viên</span>
            </div>

          </div>

          <button
            className="student-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>

        </div>
      </aside>

      {/* MAIN */}

      <main className="student-main">

        {/* HEADER */}

        <header className="student-header">

          <div className="student-header-left">

            <button
              className="student-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <h2>{pageTitles[currentPage]}</h2>

              <p>
                Hệ thống quản lý thực tập và đánh giá doanh nghiệp
              </p>
            </div>

          </div>

          <div className="student-header-right">

            <div className="student-header-user">

              <div className="student-avatar">
                {studentName.charAt(0).toUpperCase()}
              </div>

              <span>{studentName}</span>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="student-content">

          {renderContent()}

          <footer className="student-footer">
            © 2026 EDU-06 - Cổng quản lý thực tập và đánh giá doanh nghiệp
          </footer>

        </div>
      </main>
    </div>
  );
}
