
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  GraduationCap,
  CalendarDays,
  FileText,
  X,
  Eye,
  ClipboardCheck,
} from "lucide-react";

import "../styles/InternshipApproval.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const BASE_URL = `${API_URL}/api/dang-ky-thuc-tap`;

function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.danhSach)) return data.danhSach;
  return [];
}

function layGiaTri(obj, ...keys) {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }
  return "";
}

function hienThiTrangThai(status) {
  const value = String(status || "").toUpperCase();

  switch (value) {
    case "DA_DUYET":
    case "CHAP_NHAN":
    case "DA_CHAP_NHAN":
      return "Đã chấp nhận";

    case "TU_CHOI":
      return "Đã từ chối";

    case "CHO_DUYET":
      return "Chờ duyệt";

    default:
      return value || "Chưa có trạng thái";
  }
}

function mauTrangThai(status) {
  const value = String(status || "").toUpperCase();

  if (
    ["DA_DUYET", "CHAP_NHAN", "DA_CHAP_NHAN"].includes(value)
  ) {
    return "approved";
  }

  if (value === "TU_CHOI") {
    return "rejected";
  }

  return "pending";
}

function InternshipApproval() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [ngayBatDau, setNgayBatDau] = useState("");
  const [ngayKetThuc, setNgayKetThuc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  // Lấy token đăng nhập
  const getToken = () => localStorage.getItem("token");

  // Gọi API
  const requestApi = async (url, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const text = await response.text();

    let result = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text };
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        `Lỗi máy chủ: ${response.status}`
      );
    }

    return result;
  };

  // Tải danh sách hồ sơ
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await requestApi(
        `${BASE_URL}/giang-vien`
      );

      setApplications(layDanhSach(result));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đăng ký!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Lấy thông tin hồ sơ
  const getInfo = (item) => ({
    id: layGiaTri(item, "maDangKy", "id"),
    maSv: layGiaTri(item, "maSv", "maSV"),
    tenSv: layGiaTri(
      item,
      "tenSinhVien",
      "hoTen",
      "tenSv",
      "tenSV"
    ),
    maViTri: layGiaTri(item, "maViTri"),
    tenViTri: layGiaTri(
      item,
      "tenViTri",
      "tenViTriThucTap",
      "viTri"
    ),
    tenDoanhNghiep: layGiaTri(
      item,
      "tenDoanhNghiep",
      "tenCongTy",
      "tenDn"
    ),
    ngayDangKy: layGiaTri(item, "ngayDangKy"),
    noiDung: layGiaTri(item, "noiDung"),
    trangThai: layGiaTri(item, "trangThai"),
    trangThaiGv: layGiaTri(
      item,
      "trangThaiGv",
      "trangThaiGV"
    ),
    trangThaiDn: layGiaTri(
      item,
      "trangThaiDn",
      "trangThaiDN"
    ),
  });

  // Kiểm tra điều kiện giảng viên được duyệt
  const duocDuyet = (item) => {
    const info = getInfo(item);

    return (
      info.trangThaiGv === "CHO_DUYET" &&
      ["CHAP_NHAN", "DA_DUYET", "DA_CHAP_NHAN", "DONG_Y"].includes(
        String(info.trangThaiDn).toUpperCase()
      )
    );
  };

  // Chấp nhận hồ sơ
  const handleApprove = async () => {
    if (!selectedApplication) return;

    if (!ngayBatDau || !ngayKetThuc) {
      alert("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc!");
      return;
    }

    if (ngayKetThuc <= ngayBatDau) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    try {
      setSubmitting(true);

      const info = getInfo(selectedApplication);

      await requestApi(
        `${BASE_URL}/${info.id}/giang-vien/chap-nhan`,
        {
          method: "PUT",
          body: JSON.stringify({
            ngayBatDau,
            ngayKetThuc,
          }),
        }
      );

      setShowApproveModal(false);
      setSelectedApplication(null);
      setNgayBatDau("");
      setNgayKetThuc("");

      setMessage("Đã chấp nhận hồ sơ đăng ký thực tập!");
      await fetchApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Từ chối hồ sơ
  const handleReject = async (item) => {
    const info = getInfo(item);

    const confirmed = window.confirm(
      `Bà có chắc chắn muốn từ chối hồ sơ của ${info.tenSv || info.maSv}?`
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      await requestApi(
        `${BASE_URL}/${info.id}/giang-vien/tu-choi`,
        {
          method: "PUT",
        }
      );

      setMessage("Đã từ chối hồ sơ đăng ký thực tập!");
      setSelectedApplication(null);
      await fetchApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Lọc và tìm kiếm
  const filteredApplications = applications.filter((item) => {
    const info = getInfo(item);

    const keyword = search.toLowerCase();

    const matchSearch =
      String(info.tenSv).toLowerCase().includes(keyword) ||
      String(info.maSv).toLowerCase().includes(keyword) ||
      String(info.tenViTri).toLowerCase().includes(keyword) ||
      String(info.tenDoanhNghiep).toLowerCase().includes(keyword);

    let matchFilter = true;

    if (filter === "PENDING") {
      matchFilter = info.trangThaiGv === "CHO_DUYET";
    } else if (filter === "APPROVED") {
      matchFilter = info.trangThaiGv === "DA_DUYET";
    } else if (filter === "REJECTED") {
      matchFilter = info.trangThaiGv === "TU_CHOI";
    }

    return matchSearch && matchFilter;
  });

  const pendingCount = applications.filter(
    (item) => getInfo(item).trangThaiGv === "CHO_DUYET"
  ).length;

  const approvedCount = applications.filter(
    (item) => getInfo(item).trangThaiGv === "DA_DUYET"
  ).length;

  const rejectedCount = applications.filter(
    (item) => getInfo(item).trangThaiGv === "TU_CHOI"
  ).length;

  return (
    <div className="internship-approval">

      {/* Tiêu đề */}
      <div className="ia-heading">
        <div>
          <h2>Duyệt đăng ký thực tập</h2>
          <p>
            Kiểm tra và xử lý hồ sơ đăng ký thực tập của sinh viên
          </p>
        </div>

        <button
          className="ia-refresh-button"
          onClick={fetchApplications}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Làm mới
        </button>
      </div>

      {/* Thông báo */}
      {message && (
        <div className="ia-success-message">
          <CheckCircle size={18} />
          {message}
          <button onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thống kê */}
      <div className="ia-statistics">
        <div className="ia-stat-card">
          <div className="ia-stat-icon orange">
            <Clock size={22} />
          </div>
          <div>
            <span>Chờ duyệt</span>
            <h3>{pendingCount}</h3>
          </div>
        </div>

        <div className="ia-stat-card">
          <div className="ia-stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>Đã chấp nhận</span>
            <h3>{approvedCount}</h3>
          </div>
        </div>

        <div className="ia-stat-card">
          <div className="ia-stat-icon red">
            <XCircle size={22} />
          </div>
          <div>
            <span>Đã từ chối</span>
            <h3>{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* Danh sách */}
      <div className="ia-panel">
        <div className="ia-panel-heading">
          <div>
            <h3>Danh sách hồ sơ đăng ký</h3>
            <p>
              Tổng cộng {filteredApplications.length} hồ sơ
            </p>
          </div>
        </div>

        {/* Tìm kiếm và lọc */}
        <div className="ia-toolbar">
          <div className="ia-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm tên, mã sinh viên, vị trí..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Tất cả hồ sơ</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã chấp nhận</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
        </div>

        {error && (
          <div className="ia-error">
            <XCircle size={19} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="ia-empty">
            <RefreshCw className="ia-loading-icon" size={28} />
            <p>Đang tải danh sách hồ sơ...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="ia-empty">
            <ClipboardCheck size={38} />
            <strong>Chưa có hồ sơ đăng ký thực tập</strong>
            <p>
              Hồ sơ sinh viên đăng ký sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="ia-table-wrapper">
            <table className="ia-table">
              <thead>
                <tr>
                  <th>Mã đăng ký</th>
                  <th>Sinh viên</th>
                  <th>Vị trí thực tập</th>
                  <th>Doanh nghiệp</th>
                  <th>Doanh nghiệp duyệt</th>
                  <th>Giảng viên duyệt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((item, index) => {
                  const info = getInfo(item);

                  return (
                    <tr key={info.id || index}>
                      <td>#{info.id || "--"}</td>

                      <td>
                        <div className="ia-student">
                          <div className="ia-student-avatar">
                            <GraduationCap size={19} />
                          </div>
                          <div>
                            <strong>
                              {info.tenSv || "Chưa có tên"}
                            </strong>
                            <span>{info.maSv || "--"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{info.tenViTri || `Vị trí #${info.maViTri || "--"}`}</td>

                      <td>
                        <div className="ia-company">
                          <Building2 size={16} />
                          {info.tenDoanhNghiep || "Chưa có thông tin"}
                        </div>
                      </td>

                      <td>
                        <span className={`ia-badge ${mauTrangThai(info.trangThaiDn)}`}>
                          {hienThiTrangThai(info.trangThaiDn)}
                        </span>
                      </td>

                      <td>
                        <span className={`ia-badge ${mauTrangThai(info.trangThaiGv)}`}>
                          {hienThiTrangThai(info.trangThaiGv)}
                        </span>
                      </td>

                      <td>
                        <div className="ia-actions">
                          <button
                            className="ia-action-detail"
                            title="Xem chi tiết"
                            onClick={() => {
                              setSelectedApplication(item);
                              setShowDetail(true);
                            }}
                          >
                            <Eye size={17} />
                          </button>

                          {info.trangThaiGv === "CHO_DUYET" && (
                            <>
                              <button
                                className="ia-action-approve"
                                title={
                                  duocDuyet(item)
                                    ? "Chấp nhận hồ sơ"
                                    : "Chờ doanh nghiệp chấp nhận"
                                }
                                disabled={!duocDuyet(item) || submitting}
                                onClick={() => {
                                  setSelectedApplication(item);
                                  setShowApproveModal(true);
                                }}
                              >
                                <CheckCircle size={17} />
                              </button>

                              <button
                                className="ia-action-reject"
                                title="Từ chối hồ sơ"
                                disabled={submitting}
                                onClick={() => handleReject(item)}
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

      {/* Modal xem chi tiết */}
      {showDetail && selectedApplication && (
        <div
          className="ia-modal-overlay"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="ia-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ia-modal-header">
              <div>
                <h3>Chi tiết hồ sơ thực tập</h3>
                <p>Mã đăng ký #{getInfo(selectedApplication).id}</p>
              </div>

              <button onClick={() => setShowDetail(false)}>
                <X size={21} />
              </button>
            </div>

            <div className="ia-detail-content">
              {(() => {
                const info = getInfo(selectedApplication);

                return (
                  <>
                    <div className="ia-detail-item">
                      <span>Mã sinh viên</span>
                      <strong>{info.maSv || "--"}</strong>
                    </div>

                    <div className="ia-detail-item">
                      <span>Họ tên sinh viên</span>
                      <strong>{info.tenSv || "--"}</strong>
                    </div>

                    <div className="ia-detail-item">
                      <span>Vị trí thực tập</span>
                      <strong>{info.tenViTri || `Vị trí #${info.maViTri || "--"}`}</strong>
                    </div>

                    <div className="ia-detail-item">
                      <span>Doanh nghiệp</span>
                      <strong>{info.tenDoanhNghiep || "--"}</strong>
                    </div>

                    <div className="ia-detail-item">
                      <span>Ngày đăng ký</span>
                      <strong>{info.ngayDangKy || "--"}</strong>
                    </div>

                    <div className="ia-detail-item full">
                      <span>Nội dung đăng ký</span>
                      <p>{info.noiDung || "Không có nội dung."}</p>
                    </div>

                    <div className="ia-detail-item">
                      <span>Doanh nghiệp</span>
                      <strong>{hienThiTrangThai(info.trangThaiDn)}</strong>
                    </div>

                    <div className="ia-detail-item">
                      <span>Giảng viên</span>
                      <strong>{hienThiTrangThai(info.trangThaiGv)}</strong>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="ia-modal-footer">
              <button
                className="ia-button-secondary"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>

              {duocDuyet(selectedApplication) && (
                <button
                  className="ia-button-primary"
                  onClick={() => {
                    setShowDetail(false);
                    setShowApproveModal(true);
                  }}
                >
                  <CheckCircle size={17} />
                  Chấp nhận hồ sơ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal nhập ngày thực tập */}
      {showApproveModal && selectedApplication && (
        <div
          className="ia-modal-overlay"
          onClick={() => {
            if (!submitting) setShowApproveModal(false);
          }}
        >
          <div
            className="ia-modal ia-approve-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ia-modal-header">
              <div>
                <h3>Xác nhận thực tập</h3>
                <p>
                  Nhập thời gian thực tập của sinh viên
                </p>
              </div>

              <button
                onClick={() => setShowApproveModal(false)}
                disabled={submitting}
              >
                <X size={21} />
              </button>
            </div>

            <div className="ia-approve-student">
              <div className="ia-student-avatar">
                <GraduationCap size={22} />
              </div>

              <div>
                <strong>
                  {getInfo(selectedApplication).tenSv ||
                    getInfo(selectedApplication).maSv}
                </strong>
                <span>
                  {getInfo(selectedApplication).tenViTri ||
                    `Vị trí #${getInfo(selectedApplication).maViTri}`}
                </span>
              </div>
            </div>

            <div className="ia-date-form">
              <div>
                <label>Ngày bắt đầu thực tập *</label>
                <input
                  type="date"
                  value={ngayBatDau}
                  onChange={(e) => setNgayBatDau(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Ngày kết thúc thực tập *</label>
                <input
                  type="date"
                  value={ngayKetThuc}
                  min={ngayBatDau || undefined}
                  onChange={(e) => setNgayKetThuc(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ia-modal-note">
              <CalendarDays size={18} />
              Sau khi chấp nhận, hệ thống sẽ tạo quá trình thực tập
              cho sinh viên.
            </div>

            <div className="ia-modal-footer">
              <button
                className="ia-button-secondary"
                disabled={submitting}
                onClick={() => setShowApproveModal(false)}
              >
                Hủy
              </button>

              <button
                className="ia-button-primary"
                disabled={submitting}
                onClick={handleApprove}
              >
                <CheckCircle size={17} />
                {submitting ? "Đang xử lý..." : "Xác nhận duyệt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternshipApproval;
