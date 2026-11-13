
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  GraduationCap,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileCheck,
  ClipboardCheck,
  Scale,
  Award,
  Bell,
  Menu,
  LogOut,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Search,
  X,
} from "lucide-react";

import api from "../services/api";

import StudentList from "./StudentList";
import InternshipApproval from "./InternshipApproval";
import InternshipTracking from "./InternshipTracking";
import LecturerJournalEvidence from "./LecturerJournalEvidence";
import LecturerEvaluation from "./LecturerEvaluation";
import LecturerReconciliation from "./LecturerReconciliation";
import ConfirmResult from "./ConfirmResult";

import "../styles/Lecturer.css";

// Danh sách menu
const menuItems = [
  { title: "Tổng quan", icon: LayoutDashboard },
  { title: "Sinh viên được phân công", icon: Users },
  { title: "Duyệt đăng ký thực tập", icon: ClipboardCheck },
  { title: "Theo dõi thực tập", icon: ClipboardList },
  { title: "Nhật ký và minh chứng", icon: FileCheck },
  { title: "Đánh giá sinh viên", icon: ClipboardCheck },
  { title: "Đối soát đánh giá", icon: Scale },
  { title: "Xác nhận kết quả", icon: Award },
];

// Tiêu đề từng trang
const pageTitles = {
  "Tổng quan": "Tổng quan hệ thống",
  "Sinh viên được phân công": "Danh sách sinh viên được phân công",
  "Duyệt đăng ký thực tập": "Duyệt hồ sơ đăng ký thực tập",
  "Theo dõi thực tập": "Theo dõi quá trình thực tập",
  "Nhật ký và minh chứng": "Quản lý nhật ký và minh chứng",
  "Đánh giá sinh viên": "Đánh giá sinh viên",
  "Đối soát đánh giá": "Đối soát đánh giá",
  "Xác nhận kết quả": "Xác nhận kết quả thực tập",
};

// Chuyển dữ liệu API thành mảng an toàn
const getArray = (data) => {
  return Array.isArray(data) ? data : [];
};

// Trang tổng quan
function DashboardHome({
  onNavigate,
  lecturerName,
  dashboardData,
}) {
  const {
    loading,
    error,
    processes,
    journalCount,
    evidenceCount,
    pendingResults,
  } = dashboardData;

  const activeCount = processes.filter(
    (item) =>
      String(item.trangThai || "").toUpperCase() === "DANG_THUC_TAP"
  ).length;

  const statistics = [
    {
      title: "Sinh viên có quá trình",
      value: processes.length,
      description: "Tổng số quá trình thực tập được phân công",
      icon: Users,
      color: "blue",
    },
    {
      title: "Đang thực tập",
      value: activeCount,
      description: "Sinh viên đang trong kỳ thực tập",
      icon: BookOpen,
      color: "green",
    },
    {
      title: "Nhật ký thực tập",
      value: journalCount,
      description: `${evidenceCount} minh chứng được đính kèm`,
      icon: FileCheck,
      color: "orange",
    },
    {
      title: "Chờ xác nhận",
      value: pendingResults.length,
      description: "Kết quả thực tập cần xác nhận",
      icon: Award,
      color: "purple",
    },
  ];

  return (
    <>
      {/* Lời chào */}
      <div className="lecturer-welcome">
        <div>
          <span className="lecturer-welcome-label">
            TRANG QUẢN LÝ GIẢNG VIÊN
          </span>

          <h1>Xin chào, {lecturerName}!</h1>

          <p>
            Chào mừng bạn đến với hệ thống quản lý thực tập
            và đánh giá doanh nghiệp.
          </p>
        </div>

        <div className="lecturer-welcome-icon">
          <GraduationCap size={76} />
        </div>
      </div>

      {/* Thống kê */}
      <div className="lecturer-section-heading">
        <div>
          <h3>Tổng quan hệ thống</h3>
          <p>Thống kê tình hình thực tập của sinh viên</p>
        </div>

        <div className="lecturer-date">
          <CalendarDays size={17} />
          <span>Thông tin hiện tại</span>
        </div>
      </div>

      {loading ? (
        <div className="lecturer-empty-state">
          <span>Đang tải dữ liệu tổng quan...</span>
        </div>
      ) : (
        <div className="lecturer-statistics">
          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <div className="lecturer-stat-card" key={item.title}>
                <div className={`lecturer-stat-icon ${item.color}`}>
                  <Icon size={23} />
                </div>

                <div className="lecturer-stat-info">
                  <span>{item.title}</span>
                  <h2>{item.value}</h2>
                  <p>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p style={{ color: "#dc2626", marginTop: 12 }}>
          {error}
        </p>
      )}

      {/* Chức năng quản lý */}
      <div className="lecturer-section-heading">
        <div>
          <h3>Chức năng quản lý</h3>
          <p>Truy cập nhanh các nghiệp vụ giảng viên</p>
        </div>
      </div>

      <div className="lecturer-function-grid">
        {menuItems.slice(1).map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              className="lecturer-function-card"
              key={item.title}
              onClick={() => onNavigate(item.title)}
            >
              <div className="lecturer-function-icon">
                <Icon size={23} />
              </div>

              <div className="lecturer-function-text">
                <strong>{item.title}</strong>
                <span>Truy cập chức năng quản lý</span>
              </div>

              <ArrowRight size={19} />
            </button>
          );
        })}
      </div>

      {/* Công việc cần xử lý */}
      <div className="lecturer-bottom-section">
        <div className="lecturer-task-panel">
          <div className="lecturer-panel-heading">
            <div>
              <h3>Công việc cần xử lý</h3>
              <p>Kết quả thực tập đang chờ giảng viên xác nhận</p>
            </div>

            <ClipboardList size={23} />
          </div>

          {loading ? (
            <div className="lecturer-empty-state">
              <span>Đang tải danh sách công việc...</span>
            </div>
          ) : pendingResults.length === 0 ? (
            <div className="lecturer-empty-state">
              <div className="lecturer-empty-icon">
                <Search size={27} />
              </div>

              <strong>Không có kết quả đang chờ xác nhận</strong>

              <span>
                Các kết quả đủ điều kiện xác nhận sẽ hiển thị tại đây.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pendingResults.map((item) => {
                const process = processes.find(
                  (p) =>
                    Number(p.maQuaTrinh) === Number(item.maQuaTrinh)
                );

                return (
                  <div
                    key={item.maQuaTrinh}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: 14,
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <strong>
                        {process?.hoTenSinhVien ||
                          item.maSv ||
                          `Quá trình ${item.maQuaTrinh}`}
                      </strong>

                      <p style={{ margin: "5px 0 0", color: "#64748b" }}>
                        Mã quá trình: {item.maQuaTrinh}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="lecturer-function-card"
                      style={{
                        width: "auto",
                        padding: "9px 12px",
                        gap: 8,
                      }}
                      onClick={() => onNavigate("Xác nhận kết quả")}
                    >
                      Xử lý
                      <ArrowRight size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Trang chưa triển khai
function ComingSoon({ title }) {
  return (
    <div className="lecturer-placeholder">
      <div className="lecturer-placeholder-icon">
        <GraduationCap size={38} />
      </div>

      <h2>{title}</h2>

      <p>
        Chức năng này sẽ được xây dựng trong giai đoạn tiếp theo.
      </p>
    </div>
  );
}

// Dashboard giảng viên
export default function LecturerDashboard() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("Tổng quan");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    loading: true,
    error: "",
    processes: [],
    journalCount: 0,
    evidenceCount: 0,
    pendingResults: [],
  });

  // Lấy thông tin tài khoản đăng nhập
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Không đọc được thông tin tài khoản:", error);
  }

  const lecturerName =
    user.hoTen ||
    user.tenGiangVien ||
    user.username ||
    "Giảng viên";

  // Lấy dữ liệu tổng quan từ Backend
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        // Lấy danh sách quá trình và kết quả chờ xác nhận
        const [processResponse, resultResponse] =
          await Promise.allSettled([
            api.get("/api/qua-trinh-thuc-tap/giang-vien"),
            api.get("/api/ket-qua/giang-vien"),
          ]);

        const processes =
          processResponse.status === "fulfilled"
            ? getArray(processResponse.value.data)
            : [];

        const results =
          resultResponse.status === "fulfilled"
            ? getArray(resultResponse.value.data)
            : [];

        // Chỉ lấy kết quả chưa xác nhận
        const pendingResults = results.filter(
          (item) =>
            String(item.trangThai || "").toUpperCase() ===
            "CHUA_XAC_NHAN"
        );

        // Lấy nhật ký của từng quá trình
        const journalResponses = await Promise.allSettled(
          processes.map((process) =>
            api.get(
              `/api/nhat-ky/giang-vien/qua-trinh/${process.maQuaTrinh}`
            )
          )
        );

        let allJournals = [];

        journalResponses.forEach((response) => {
          if (response.status === "fulfilled") {
            allJournals.push(
              ...getArray(response.value.data)
            );
          }
        });

        // Lấy minh chứng của từng nhật ký
        const evidenceResponses = await Promise.allSettled(
          allJournals.map((journal) =>
            api.get(
              `/api/minh-chung/giang-vien/nhat-ky/${journal.maNhatKy}`
            )
          )
        );

        let evidenceCount = 0;

        evidenceResponses.forEach((response) => {
          if (response.status === "fulfilled") {
            evidenceCount += getArray(response.value.data).length;
          }
        });

        if (!isMounted) return;

        setDashboardData({
          loading: false,
          error:
            processResponse.status === "rejected"
              ? "Không thể tải danh sách quá trình thực tập. Vui lòng kiểm tra kết nối Backend."
              : "",
          processes,
          journalCount: allJournals.length,
          evidenceCount,
          pendingResults,
        });
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);

        if (!isMounted) return;

        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: "Đã xảy ra lỗi khi tải dữ liệu tổng quan.",
        }));
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Chuyển trang trong Dashboard
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // Hiển thị nội dung theo menu
  const renderContent = () => {
    switch (currentPage) {
      case "Tổng quan":
        return (
          <DashboardHome
            onNavigate={handleNavigate}
            lecturerName={lecturerName}
            dashboardData={dashboardData}
          />
        );

      case "Sinh viên được phân công":
        return <StudentList />;

      case "Duyệt đăng ký thực tập":
        return <InternshipApproval />;

      case "Theo dõi thực tập":
        return <InternshipTracking />;

      case "Nhật ký và minh chứng":
        return <LecturerJournalEvidence />;

      case "Đánh giá sinh viên":
        return <LecturerEvaluation />;

      case "Đối soát đánh giá":
        return <LecturerReconciliation />;

      case "Xác nhận kết quả":
        return <ConfirmResult />;

      default:
        return (
          <ComingSoon title={pageTitles[currentPage] || currentPage} />
        );
    }
  };

  return (
    <div className="lecturer-layout">
      {/* Lớp nền khi mở menu trên điện thoại */}
      {sidebarOpen && (
        <div
          className="lecturer-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`lecturer-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="lecturer-brand">
          <div className="lecturer-brand-icon">
            <GraduationCap size={27} />
          </div>

          <div>
            <h2>EDU-06</h2>
            <span>QUẢN LÝ THỰC TẬP</span>
          </div>

          <button
            type="button"
            className="lecturer-close-menu"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="lecturer-menu-title">
          MENU CHÍNH
        </div>

        <nav className="lecturer-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.title}
                className={`lecturer-menu-item ${
                  currentPage === item.title ? "active" : ""
                }`}
                onClick={() => handleNavigate(item.title)}
              >
                <Icon size={19} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Thông tin người dùng */}
        <div className="lecturer-sidebar-bottom">
          <div className="lecturer-user">
            <div className="lecturer-avatar">GV</div>

            <div className="lecturer-user-info">
              <strong>{lecturerName}</strong>
              <span>Tài khoản giảng viên</span>
            </div>
          </div>

          <button
            type="button"
            className="lecturer-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lecturer-main">
        {/* HEADER */}
        <header className="lecturer-header">
          <div className="lecturer-header-left">
            <button
              type="button"
              className="lecturer-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2>{pageTitles[currentPage]}</h2>
              <p>Hệ thống quản lý thực tập EDU-06</p>
            </div>
          </div>

          <div className="lecturer-header-right">
            <button
              type="button"
              className="lecturer-icon-button"
              aria-label="Thông báo"
            >
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="lecturer-header-user">
              <div className="lecturer-avatar">GV</div>
              <span>{lecturerName}</span>
            </div>
          </div>
        </header>

        {/* NỘI DUNG */}
        <section className="lecturer-content">
          {renderContent()}

          <footer className="lecturer-footer">
            EDU-06 © 2026 - Cổng quản lý thực tập và đánh giá doanh nghiệp
          </footer>
        </section>
      </main>
    </div>
  );
}
