
import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  FileText,
} from "lucide-react";

import "../styles/EnterpriseRegistrations.css";

const API_URL = "http://localhost:8080/api";

async function requestApi(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (response.status === 403) {
      throw new Error("Tài khoản không có quyền thực hiện chức năng này.");
    }

    throw new Error(
      data?.message ||
      (typeof data === "string" && data) ||
      `Lỗi máy chủ (${response.status})`
    );
  }

  return data;
}

function formatDate(date) {
  if (!date) return "Chưa có";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString("vi-VN");
}

function getStatus(status) {
  switch (status) {
    case "CHO_DUYET":
      return {
        label: "Chờ duyệt",
        className: "waiting",
      };

    case "CHAP_NHAN":
    case "DA_DUYET":
      return {
        label: "Đã chấp nhận",
        className: "accepted",
      };

    case "TU_CHOI":
      return {
        label: "Đã từ chối",
        className: "rejected",
      };

    default:
      return {
        label: status || "Chưa xác định",
        className: "unknown",
      };
  }
}

export default function EnterpriseRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  // =========================================
  // TẢI DANH SÁCH ĐĂNG KÝ
  // =========================================

  const loadRegistrations = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await requestApi(
        "/dang-ky-thuc-tap/doanh-nghiep"
      );

      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // =========================================
  // XỬ LÝ CHẤP NHẬN / TỪ CHỐI
  // =========================================

  const handleProcess = async (item, action) => {
    const isAccept = action === "chap-nhan";

    const message = isAccept
      ? `Bạn có chắc muốn chấp nhận sinh viên ${item.maSv}?`
      : `Bạn có chắc muốn từ chối đăng ký của sinh viên ${item.maSv}?`;

    if (!window.confirm(message)) return;

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const data = await requestApi(
        `/dang-ky-thuc-tap/${item.maDangKy}/${action}`,
        {
          method: "PUT",
        }
      );

      setSuccess(
        data?.message ||
        (isAccept
          ? "Đã chấp nhận sinh viên!"
          : "Đã từ chối đăng ký!")
      );

      setSelected(null);

      await loadRegistrations();
    } catch (err) {
      setError(err.message || "Không thể xử lý đăng ký.");
    } finally {
      setProcessing(false);
    }
  };

  // =========================================
  // LỌC DANH SÁCH
  // =========================================

  const filteredRegistrations = registrations.filter((item) => {
    const search = keyword.trim().toLowerCase();

    const matchKeyword =
      !search ||
      String(item.maSv || "").toLowerCase().includes(search) ||
      String(item.tenViTri || "").toLowerCase().includes(search) ||
      String(item.maDangKy || "").includes(search);

    const matchStatus =
      filter === "ALL" || item.trangThaiDn === filter;

    return matchKeyword && matchStatus;
  });

  const waitingCount = registrations.filter(
    (item) => item.trangThaiDn === "CHO_DUYET"
  ).length;

  const acceptedCount = registrations.filter(
    (item) => item.trangThaiDn === "CHAP_NHAN"
  ).length;

  const rejectedCount = registrations.filter(
    (item) => item.trangThaiDn === "TU_CHOI"
  ).length;

  // =========================================
  // GIAO DIỆN
  // =========================================

  return (
    <div className="enterprise-registrations">

      <div className="registration-page-heading">
        <div>
          <h2>Quản lý đăng ký thực tập</h2>
          <p>
            Xem xét và xử lý các đăng ký thực tập từ sinh viên.
          </p>
        </div>

        <button
          className="registration-refresh-btn"
          onClick={loadRegistrations}
          disabled={loading || processing}
        >
          <RefreshCw
            size={17}
            className={loading ? "registration-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* THỐNG KÊ */}

      <div className="registration-stats">

        <div className="registration-stat-card">
          <div className="registration-stat-icon blue">
            <Users size={23} />
          </div>
          <div>
            <span>Tổng đăng ký</span>
            <h3>{registrations.length}</h3>
          </div>
        </div>

        <div className="registration-stat-card">
          <div className="registration-stat-icon orange">
            <Clock size={23} />
          </div>
          <div>
            <span>Chờ duyệt</span>
            <h3>{waitingCount}</h3>
          </div>
        </div>

        <div className="registration-stat-card">
          <div className="registration-stat-icon green">
            <CheckCircle size={23} />
          </div>
          <div>
            <span>Đã chấp nhận</span>
            <h3>{acceptedCount}</h3>
          </div>
        </div>

        <div className="registration-stat-card">
          <div className="registration-stat-icon red">
            <XCircle size={23} />
          </div>
          <div>
            <span>Đã từ chối</span>
            <h3>{rejectedCount}</h3>
          </div>
        </div>

      </div>

      {/* THÔNG BÁO */}

      {error && (
        <div className="registration-alert error">
          <XCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="registration-alert success">
          <CheckCircle size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* BỘ LỌC */}

      <div className="registration-toolbar">

        <div className="registration-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Tìm theo mã sinh viên, vị trí..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="CHO_DUYET">Chờ duyệt</option>
          <option value="CHAP_NHAN">Đã chấp nhận</option>
          <option value="TU_CHOI">Đã từ chối</option>
        </select>

      </div>

      {/* DANH SÁCH */}

      <div className="registration-table-card">

        <div className="registration-table-heading">
          <div>
            <h3>Danh sách sinh viên đăng ký</h3>
            <p>
              Có {filteredRegistrations.length} kết quả
            </p>
          </div>
        </div>

        {loading ? (
          <div className="registration-state">
            <RefreshCw size={28} className="registration-spin" />
            <p>Đang tải danh sách đăng ký...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="registration-state">
            <div className="registration-empty-icon">
              <Users size={35} />
            </div>
            <h3>Chưa có đăng ký thực tập</h3>
            <p>
              Không tìm thấy sinh viên đăng ký phù hợp.
            </p>
          </div>
        ) : (
          <div className="registration-table-wrapper">
            <table className="registration-table">
              <thead>
                <tr>
                  <th>Mã đăng ký</th>
                  <th>Sinh viên</th>
                  <th>Vị trí thực tập</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.map((item) => {
                  const status = getStatus(item.trangThaiDn);

                  return (
                    <tr key={item.maDangKy}>
                      <td>
                        <strong>#{item.maDangKy}</strong>
                      </td>

                      <td>
                        <div className="registration-student">
                          <div className="registration-student-avatar">
                            <GraduationCap size={19} />
                          </div>
                          <div>
                            <strong>{item.maSv}</strong>
                            <span>Mã sinh viên</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="registration-position">
                          <BriefcaseBusiness size={17} />
                          <span>{item.tenViTri || "Chưa có tên vị trí"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="registration-date">
                          <CalendarDays size={16} />
                          {formatDate(item.ngayDangKy)}
                        </div>
                      </td>

                      <td>
                        <span className={`registration-status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <div className="registration-actions">
                          <button
                            className="registration-action-btn view"
                            title="Xem chi tiết"
                            onClick={() => setSelected(item)}
                          >
                            <Eye size={17} />
                          </button>

                          {item.trangThaiDn === "CHO_DUYET" && (
                            <>
                              <button
                                className="registration-action-btn accept"
                                title="Chấp nhận"
                                disabled={processing}
                                onClick={() =>
                                  handleProcess(item, "chap-nhan")
                                }
                              >
                                <CheckCircle size={17} />
                              </button>

                              <button
                                className="registration-action-btn reject"
                                title="Từ chối"
                                disabled={processing}
                                onClick={() =>
                                  handleProcess(item, "tu-choi")
                                }
                              >
                                <XCircle size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* CHI TIẾT ĐĂNG KÝ */}

      {selected && (
        <div
          className="registration-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="registration-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="registration-modal-heading">
              <div>
                <h3>Chi tiết đăng ký thực tập</h3>
                <p>Mã đăng ký: #{selected.maDangKy}</p>
              </div>

              <button onClick={() => setSelected(null)}>
                <X size={21} />
              </button>
            </div>

            <div className="registration-detail-list">

              <div className="registration-detail-item">
                <GraduationCap size={19} />
                <div>
                  <span>Mã sinh viên</span>
                  <strong>{selected.maSv}</strong>
                </div>
              </div>

              <div className="registration-detail-item">
                <BriefcaseBusiness size={19} />
                <div>
                  <span>Vị trí thực tập</span>
                  <strong>{selected.tenViTri || "Chưa có thông tin"}</strong>
                </div>
              </div>

              <div className="registration-detail-item">
                <CalendarDays size={19} />
                <div>
                  <span>Ngày đăng ký</span>
                  <strong>{formatDate(selected.ngayDangKy)}</strong>
                </div>
              </div>

              <div className="registration-detail-item">
                <GraduationCap size={19} />
                <div>
                  <span>Mã giảng viên hướng dẫn</span>
                  <strong>{selected.maGv || "Chưa có"}</strong>
                </div>
              </div>

              <div className="registration-detail-item full">
                <FileText size={19} />
                <div>
                  <span>Nội dung đăng ký</span>
                  <p>{selected.noiDung || "Sinh viên không cung cấp nội dung."}</p>
                </div>
              </div>

              <div className="registration-detail-item full">
                <div>
                  <span>Trạng thái giảng viên</span>
                  <strong>{getStatus(selected.trangThaiGv).label}</strong>
                </div>
              </div>

              <div className="registration-detail-item full">
                <div>
                  <span>Trạng thái doanh nghiệp</span>
                  <strong>{getStatus(selected.trangThaiDn).label}</strong>
                </div>
              </div>

            </div>

            {selected.trangThaiDn === "CHO_DUYET" && (
              <div className="registration-modal-actions">
                <button
                  className="registration-modal-reject"
                  disabled={processing}
                  onClick={() =>
                    handleProcess(selected, "tu-choi")
                  }
                >
                  <XCircle size={17} />
                  Từ chối
                </button>

                <button
                  className="registration-modal-accept"
                  disabled={processing}
                  onClick={() =>
                    handleProcess(selected, "chap-nhan")
                  }
                >
                  <CheckCircle size={17} />
                  Chấp nhận
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
