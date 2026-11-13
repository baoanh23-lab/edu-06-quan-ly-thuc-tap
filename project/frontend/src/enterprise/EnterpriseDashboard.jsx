
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Users,
  ClipboardList,
  Star,
  UserCircle,
  LogOut,
  Menu,
  Bell,
  ChevronRight,
  GraduationCap,
  Clock,
  FileText,
  Save,
  Pencil,
  X,
  Mail,
  MapPin,
  Phone,
  Hash,
  RefreshCw,
} from "lucide-react";

import "../styles/Enterprise.css";
import EnterprisePositions from "./EnterprisePositions";
import EnterpriseRegistrations from "./EnterpriseRegistrations";
import EnterpriseInternshipTracking from "./EnterpriseInternshipTracking";
import EnterpriseEvaluation from "./EnterpriseEvaluation";

const API_URL = "http://localhost:8080/api";

const menuItems = [
  { title: "Tổng quan", icon: LayoutDashboard },
  { title: "Hồ sơ doanh nghiệp", icon: Building2 },
  { title: "Vị trí thực tập", icon: BriefcaseBusiness },
  { title: "Sinh viên thực tập", icon: Users },
  { title: "Theo dõi thực tập", icon: ClipboardList },
  { title: "Đánh giá sinh viên", icon: Star },
  { title: "Tài khoản cá nhân", icon: UserCircle },
];

function getToken() {
  return localStorage.getItem("token");
}

// ==================== GỌI API ====================

async function requestApi(url, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "Tài khoản không có quyền truy cập chức năng này."
      );
    }

    throw new Error(
      data?.message ||
        (typeof data === "string" && data) ||
        `Lỗi máy chủ (${response.status})`
    );
  }

  return data;
}

// ==================== MÀN HÌNH ĐANG XÂY DỰNG ====================

function ComingSoon({ title }) {
  return (
    <div className="enterprise-empty">
      <div className="enterprise-empty-icon">
        <FileText size={34} />
      </div>
      <h2>{title}</h2>
      <p>Chức năng đang được xây dựng.</p>
    </div>
  );
}

// ==================== TỔNG QUAN DOANH NGHIỆP ====================

function Overview({ companyName, setActiveMenu }) {
  const [statistics, setStatistics] = useState({
    positions: 0,
    students: 0,
    waiting: 0,
    evaluated: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      setLoadingStats(true);
      setStatsError("");

      try {
        const [
          positions,
          processes,
          evaluations,
        ] = await Promise.all([
          // Tổng số vị trí thực tập của doanh nghiệp
          requestApi(
            "/vi-tri-thuc-tap/doanh-nghiep/so-luong"
          ),

          // Danh sách quá trình thực tập của doanh nghiệp
          requestApi(
            "/qua-trinh-thuc-tap/doanh-nghiep"
          ),

          // Danh sách đánh giá của doanh nghiệp
          requestApi(
            "/danh-gia/doanh-nghiep"
          ),
        ]);

        if (!isMounted) return;

        console.log("Số vị trí thực tập:", positions);
        console.log("Danh sách quá trình:", processes);
        console.log("Danh sách đánh giá:", evaluations);

        setStatistics({
          // API trả về số Long
          positions: Number(positions) || 0,

          // Số quá trình đang thực tập
          students: Array.isArray(processes)
            ? processes.filter(
                (item) =>
                  item.trangThai === "DANG_THUC_TAP"
              ).length
            : 0,

          // Số quá trình chưa được doanh nghiệp đánh giá
          waiting: Array.isArray(evaluations)
            ? evaluations.filter(
                (item) => item.daDanhGia === false
              ).length
            : 0,

          // Số quá trình đã được doanh nghiệp đánh giá
          evaluated: Array.isArray(evaluations)
            ? evaluations.filter(
                (item) => item.daDanhGia === true
              ).length
            : 0,
        });
      } catch (error) {
        console.error(
          "Lỗi tải thống kê doanh nghiệp:",
          error
        );

        if (isMounted) {
          setStatsError(
            error.message ||
              "Không thể tải dữ liệu thống kê."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      title: "Vị trí thực tập",
      value: statistics.positions,
      icon: BriefcaseBusiness,
      color: "blue",
    },
    {
      title: "Sinh viên đang thực tập",
      value: statistics.students,
      icon: GraduationCap,
      color: "green",
    },
    {
      title: "Chờ đánh giá",
      value: statistics.waiting,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Đã đánh giá",
      value: statistics.evaluated,
      icon: Star,
      color: "purple",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý hồ sơ",
      description: "Cập nhật thông tin doanh nghiệp",
      icon: Building2,
      target: "Hồ sơ doanh nghiệp",
    },
    {
      title: "Vị trí thực tập",
      description: "Quản lý các vị trí tuyển thực tập",
      icon: BriefcaseBusiness,
      target: "Vị trí thực tập",
    },
    {
      title: "Sinh viên thực tập",
      description: "Xem danh sách sinh viên",
      icon: Users,
      target: "Sinh viên thực tập",
    },
    {
      title: "Đánh giá sinh viên",
      description: "Thực hiện đánh giá thực tập",
      icon: Star,
      target: "Đánh giá sinh viên",
    },
  ];

  return (
    <>
      <div className="enterprise-welcome">
        <div>
          <h2>Xin chào, {companyName}!</h2>
          <p>
            Chào mừng bạn đến với hệ thống quản lý thực tập
            và đánh giá doanh nghiệp.
          </p>
        </div>

        <div className="enterprise-welcome-icon">
          <Building2 size={42} />
        </div>
      </div>

      {statsError && (
        <div className="enterprise-profile-alert error">
          {statsError}
        </div>
      )}

      <div className="enterprise-stats">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className="enterprise-stat-card"
              key={item.title}
            >
              <div
                className={`enterprise-stat-icon ${item.color}`}
              >
                <Icon size={23} />
              </div>

              <div>
                <p>{item.title}</p>
                <h3>
                  {loadingStats ? "..." : item.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="enterprise-section">
        <div className="enterprise-section-heading">
          <div>
            <h3>Chức năng nhanh</h3>
            <p>
              Truy cập nhanh các chức năng quản lý thực tập.
            </p>
          </div>
        </div>

        <div className="enterprise-quick-grid">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className="enterprise-quick-card"
                key={item.title}
                onClick={() => setActiveMenu(item.target)}
              >
                <div className="enterprise-quick-icon">
                  <Icon size={23} />
                </div>

                <div className="enterprise-quick-content">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>

                <ChevronRight size={20} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ==================== TRƯỜNG THÔNG TIN HỒ SƠ ====================

function ProfileField({
  label,
  icon: Icon,
  value,
  editing,
  name,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div className="enterprise-profile-field">
      <label htmlFor={`enterprise-${name}`}>
        {label}
      </label>

      <div className="enterprise-profile-input-wrap">
        <Icon size={19} />

        {editing ? (
          <input
            id={`enterprise-${name}`}
            name={name}
            type={type}
            value={value ?? ""}
            placeholder={
              placeholder ||
              `Nhập ${label.toLowerCase()}`
            }
            onChange={onChange}
          />
        ) : (
          <span className="enterprise-profile-value">
            {value || "Chưa cập nhật"}
          </span>
        )}
      </div>
    </div>
  );
}

// ==================== HỒ SƠ DOANH NGHIỆP ====================

function EnterpriseProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await requestApi("/doanh-nghiep/ho-so");

      setProfile(data);

      setForm({
        tenDn: data.tenDn || "",
        email: data.email || "",
        diaChi: data.diaChi || "",
        soDienThoai: data.soDienThoai || "",
      });
    } catch (err) {
      if (
        err.message.includes(
          "Phiên đăng nhập đã hết hạn"
        )
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.message ||
          "Không thể tải hồ sơ doanh nghiệp."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setForm({
      tenDn: profile?.tenDn || "",
      email: profile?.email || "",
      diaChi: profile?.diaChi || "",
      soDienThoai: profile?.soDienThoai || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.tenDn.trim()) {
      setError(
        "Tên doanh nghiệp không được để trống."
      );
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      setError("Email không đúng định dạng.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await requestApi(
        "/doanh-nghiep/ho-so",
        {
          method: "PUT",
          body: JSON.stringify({
            tenDn: form.tenDn.trim(),
            email: form.email.trim(),
            diaChi: form.diaChi.trim(),
            soDienThoai: form.soDienThoai.trim(),
          }),
        }
      );

      setProfile(data);

      setForm({
        tenDn: data.tenDn || "",
        email: data.email || "",
        diaChi: data.diaChi || "",
        soDienThoai: data.soDienThoai || "",
      });

      setEditing(false);
      setSuccess(
        "Cập nhật hồ sơ doanh nghiệp thành công!"
      );
    } catch (err) {
      if (
        err.message.includes(
          "Phiên đăng nhập đã hết hạn"
        )
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.message || "Không thể cập nhật hồ sơ."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="enterprise-profile-state">
        <RefreshCw
          className="enterprise-spin"
          size={28}
        />
        <p>Đang tải hồ sơ doanh nghiệp...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="enterprise-profile-state">
        <div className="enterprise-profile-alert error">
          <p>
            {error ||
              "Không tìm thấy hồ sơ doanh nghiệp."}
          </p>
        </div>

        <button
          className="enterprise-profile-btn primary"
          onClick={loadProfile}
        >
          <RefreshCw size={17} />
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="enterprise-profile">
      <div className="enterprise-profile-banner">
        <div className="enterprise-profile-banner-icon">
          <Building2 size={34} />
        </div>

        <div className="enterprise-profile-banner-text">
          <span>THÔNG TIN TỔ CHỨC</span>
          <h2>{profile.tenDn || "Doanh nghiệp"}</h2>
          <p>
            Quản lý thông tin hồ sơ doanh nghiệp của bạn.
          </p>
        </div>

        {!editing && (
          <button
            className="enterprise-profile-btn light"
            onClick={() => {
              setError("");
              setSuccess("");
              setEditing(true);
            }}
          >
            <Pencil size={17} />
            Chỉnh sửa
          </button>
        )}
      </div>

      {error && (
        <div className="enterprise-profile-alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="enterprise-profile-alert success">
          {success}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="enterprise-profile-card">
          <div className="enterprise-profile-card-heading">
            <div>
              <h3>Thông tin doanh nghiệp</h3>
              <p>
                {editing
                  ? "Cập nhật các thông tin bên dưới rồi lưu thay đổi."
                  : "Thông tin được lấy từ hồ sơ doanh nghiệp trên hệ thống."}
              </p>
            </div>

            <Building2 size={24} />
          </div>

          <div className="enterprise-profile-grid">
            <ProfileField
              label="Mã doanh nghiệp"
              icon={Hash}
              value={profile.maDn}
              editing={false}
              name="maDn"
            />

            <ProfileField
              label="Tên doanh nghiệp"
              icon={Building2}
              value={form.tenDn}
              editing={editing}
              name="tenDn"
              onChange={handleChange}
            />

            <ProfileField
              label="Email liên hệ"
              icon={Mail}
              value={form.email}
              editing={editing}
              name="email"
              type="email"
              onChange={handleChange}
            />

            <ProfileField
              label="Số điện thoại"
              icon={Phone}
              value={form.soDienThoai}
              editing={editing}
              name="soDienThoai"
              type="tel"
              onChange={handleChange}
            />

            <div className="enterprise-profile-field full">
              <ProfileField
                label="Địa chỉ"
                icon={MapPin}
                value={form.diaChi}
                editing={editing}
                name="diaChi"
                onChange={handleChange}
              />
            </div>
          </div>

          {editing && (
            <div className="enterprise-profile-actions">
              <button
                type="button"
                className="enterprise-profile-btn secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={17} />
                Hủy
              </button>

              <button
                type="submit"
                className="enterprise-profile-btn primary"
                disabled={saving}
              >
                <Save size={17} />
                {saving
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="enterprise-profile-note">
        <FileText size={19} />
        <p>
          Mã doanh nghiệp và liên kết tài khoản được hệ thống
          quản lý. Doanh nghiệp chỉ cập nhật các thông tin liên hệ
          được cho phép.
        </p>
      </div>
    </div>
  );
}

// ==================== DASHBOARD DOANH NGHIỆP ====================

export default function EnterpriseDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Tổng quan");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    user = {};
  }

  const companyName =
    user.tenDn ||
    user.tenDoanhNghiep ||
    user.tenCongTy ||
    user.hoTen ||
    user.username ||
    "Doanh nghiệp";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderContent = () => {
    if (activeMenu === "Tổng quan") {
      return (
        <Overview
          companyName={companyName}
          setActiveMenu={setActiveMenu}
        />
      );
    }

    if (activeMenu === "Hồ sơ doanh nghiệp") {
      return <EnterpriseProfile />;
    }

    if (activeMenu === "Vị trí thực tập") {
      return <EnterprisePositions />;
    }

    if (activeMenu === "Sinh viên thực tập") {
      return <EnterpriseRegistrations />;
    }

    if (activeMenu === "Theo dõi thực tập") {
      return <EnterpriseInternshipTracking />;
    }

    if (activeMenu === "Đánh giá sinh viên") {
      return <EnterpriseEvaluation />;
    }

    return <ComingSoon title={activeMenu} />;
  };

  return (
    <div className="enterprise-layout">
      <aside
        className={`enterprise-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="enterprise-brand">
          <div className="enterprise-brand-icon">
            <Building2 size={25} />
          </div>

          <div>
            <h2>EDU-06</h2>
            <span>Enterprise Portal</span>
          </div>
        </div>

        <div className="enterprise-menu-label">
          MENU CHÍNH
        </div>

        <nav className="enterprise-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className={`enterprise-nav-item ${
                  activeMenu === item.title ? "active" : ""
                }`}
                onClick={() => {
                  setActiveMenu(item.title);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="enterprise-sidebar-bottom">
          <div className="enterprise-user-mini">
            <div className="enterprise-avatar">
              <Building2 size={20} />
            </div>

            <div className="enterprise-user-info">
              <strong>{companyName}</strong>
              <span>Doanh nghiệp</span>
            </div>
          </div>

          <button
            className="enterprise-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="enterprise-main">
        <header className="enterprise-header">
          <div className="enterprise-header-left">
            <button
              className="enterprise-menu-toggle"
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
            >
              <Menu size={23} />
            </button>

            <div>
              <h1>{activeMenu}</h1>
              <p>
                Hệ thống quản lý thực tập và đánh giá doanh nghiệp
              </p>
            </div>
          </div>

          <div className="enterprise-header-right">
            <button
              className="enterprise-notification"
              title="Thông báo"
              type="button"
            >
              <Bell size={21} />
              <span></span>
            </button>

            <div className="enterprise-header-user">
              <div className="enterprise-header-avatar">
                <Building2 size={20} />
              </div>

              <div>
                <strong>{companyName}</strong>
                <span>Doanh nghiệp</span>
              </div>
            </div>
          </div>
        </header>

        <div className="enterprise-content">
          <div className="enterprise-breadcrumb">
            <span>Trang chủ</span>
            <ChevronRight size={15} />
            <strong>{activeMenu}</strong>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
