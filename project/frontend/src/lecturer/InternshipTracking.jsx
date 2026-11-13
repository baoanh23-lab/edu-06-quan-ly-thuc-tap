
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Building2,
  CalendarDays,
  BriefcaseBusiness,
  Clock3,
  Mail,
  Phone,
  MapPin,
  Eye,
  X,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

import api from "../services/api";
import "../styles/InternshipTracking.css";

function formatDate(date) {
  if (!date) return "Chưa cập nhật";

  const value = String(date).split("T")[0];
  const parts = value.split("-");

  if (parts.length !== 3) return value;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getStatus(status) {
  const statuses = {
    CHUA_BAT_DAU: {
      label: "Chưa bắt đầu",
      className: "tracking-status-pending",
    },
    DANG_THUC_TAP: {
      label: "Đang thực tập",
      className: "tracking-status-active",
    },
    HOAN_THANH: {
      label: "Hoàn thành",
      className: "tracking-status-completed",
    },
    DA_HOAN_THANH: {
      label: "Đã hoàn thành",
      className: "tracking-status-completed",
    },
    TAM_DUNG: {
      label: "Tạm dừng",
      className: "tracking-status-paused",
    },
  };

  return statuses[status] || {
    label: status || "Chưa xác định",
    className: "tracking-status-default",
  };
}

function calculateProgress(startDate, endDate, status) {
  if (status === "HOAN_THANH" || status === "DA_HOAN_THANH") {
    return 100;
  }

  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const today = new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  if (today < start) return 0;
  if (today >= end) return 100;

  const total = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();

  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function InternshipTracking() {
  const [trackingList, setTrackingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/qua-trinh-thuc-tap/giang-vien"
      );

      setTrackingList(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Lỗi tải quá trình thực tập:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Không thể tải danh sách quá trình thực tập."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const filteredList = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return trackingList.filter((item) => {
      const matchKeyword =
        !normalizedKeyword ||
        [
          item.maSv,
          item.hoTenSinhVien,
          item.tenViTri,
          item.tenDoanhNghiep,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedKeyword)
          );

      const matchStatus =
        statusFilter === "ALL" ||
        item.trangThai === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [trackingList, keyword, statusFilter]);

  const statistics = useMemo(() => ({
    total: trackingList.length,
    active: trackingList.filter(
      (item) => item.trangThai === "DANG_THUC_TAP"
    ).length,
    pending: trackingList.filter(
      (item) => item.trangThai === "CHUA_BAT_DAU"
    ).length,
    completed: trackingList.filter(
      (item) =>
        ["HOAN_THANH", "DA_HOAN_THANH"].includes(item.trangThai)
    ).length,
  }), [trackingList]);

  return (
    <div className="tracking-page">

      {/* Tiêu đề */}
      <div className="tracking-heading">
        <div>
          <span className="tracking-eyebrow">
            QUẢN LÝ SINH VIÊN
          </span>

          <h2>Theo dõi thực tập</h2>

          <p>
            Theo dõi quá trình thực tập của sinh viên được phân công.
          </p>
        </div>

        <button
          type="button"
          className="tracking-refresh-button"
          onClick={fetchTracking}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "tracking-spinning" : ""} />
          Làm mới
        </button>
      </div>

      {/* Thống kê */}
      <div className="tracking-statistics">

        <div className="tracking-stat-card">
          <div className="tracking-stat-icon blue">
            <Users size={23} />
          </div>
          <div>
            <span>Tổng sinh viên</span>
            <strong>{statistics.total}</strong>
            <small>Sinh viên có quá trình thực tập</small>
          </div>
        </div>

        <div className="tracking-stat-card">
          <div className="tracking-stat-icon green">
            <BriefcaseBusiness size={23} />
          </div>
          <div>
            <span>Đang thực tập</span>
            <strong>{statistics.active}</strong>
            <small>Đang trong kỳ thực tập</small>
          </div>
        </div>

        <div className="tracking-stat-card">
          <div className="tracking-stat-icon orange">
            <Clock3 size={23} />
          </div>
          <div>
            <span>Chưa bắt đầu</span>
            <strong>{statistics.pending}</strong>
            <small>Chưa đến ngày bắt đầu</small>
          </div>
        </div>

        <div className="tracking-stat-card">
          <div className="tracking-stat-icon purple">
            <GraduationCap size={23} />
          </div>
          <div>
            <span>Hoàn thành</span>
            <strong>{statistics.completed}</strong>
            <small>Đã kết thúc kỳ thực tập</small>
          </div>
        </div>

      </div>

      {/* Bộ lọc */}
      <div className="tracking-filter-panel">
        <div className="tracking-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Tìm mã sinh viên, họ tên, vị trí hoặc doanh nghiệp..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Lọc trạng thái thực tập"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="CHUA_BAT_DAU">Chưa bắt đầu</option>
          <option value="DANG_THUC_TAP">Đang thực tập</option>
          <option value="HOAN_THANH">Hoàn thành</option>
        </select>
      </div>

      {/* Danh sách */}
      <div className="tracking-list-panel">

        <div className="tracking-list-heading">
          <div>
            <h3>Danh sách quá trình thực tập</h3>
            <p>
              Tìm thấy {filteredList.length} quá trình thực tập
            </p>
          </div>

          <ClipboardList size={24} />
        </div>

        {loading ? (
          <div className="tracking-message">
            <RefreshCw size={25} className="tracking-spinning" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="tracking-error">
            <strong>Không thể tải dữ liệu</strong>
            <p>{String(error)}</p>
            <button type="button" onClick={fetchTracking}>
              Thử lại
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="tracking-empty">
            <div>
              <Search size={30} />
            </div>
            <strong>Không tìm thấy quá trình thực tập</strong>
            <p>
              {trackingList.length === 0
                ? "Hiện chưa có sinh viên nào được tạo quá trình thực tập."
                : "Không có kết quả phù hợp với thông tin tìm kiếm."}
            </p>
          </div>
        ) : (
          <div className="tracking-table-wrapper">
            <table className="tracking-table">
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>Doanh nghiệp</th>
                  <th>Vị trí thực tập</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>

              <tbody>
                {filteredList.map((item) => {
                  const status = getStatus(item.trangThai);
                  const progress = calculateProgress(
                    item.ngayBatDau,
                    item.ngayKetThuc,
                    item.trangThai
                  );

                  return (
                    <tr key={item.maQuaTrinh}>
                      <td>
                        <div className="tracking-student-cell">
                          <div className="tracking-student-avatar">
                            {(item.hoTenSinhVien || item.maSv || "SV")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {item.hoTenSinhVien || "Chưa cập nhật"}
                            </strong>
                            <span>{item.maSv}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="tracking-company-cell">
                          <strong>
                            {item.tenDoanhNghiep || "Chưa cập nhật"}
                          </strong>
                          <span>{item.maDn || "Chưa có mã doanh nghiệp"}</span>
                        </div>
                      </td>

                      <td>{item.tenViTri || "Chưa cập nhật"}</td>

                      <td>
                        <div className="tracking-date-cell">
                          <span>{formatDate(item.ngayBatDau)}</span>
                          <small>
                            đến {formatDate(item.ngayKetThuc)}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span className={`tracking-status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="tracking-detail-button"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye size={16} />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {selectedItem && (
        <div
          className="tracking-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedItem(null);
            }
          }}
        >
          <div className="tracking-modal">

            <div className="tracking-modal-header">
              <div>
                <span>THÔNG TIN QUÁ TRÌNH</span>
                <h3>Chi tiết thực tập</h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Đóng"
              >
                <X size={21} />
              </button>
            </div>

            <div className="tracking-modal-body">

              <div className="tracking-detail-section">
                <h4>
                  <GraduationCap size={19} />
                  Thông tin sinh viên
                </h4>

                <div className="tracking-detail-grid">
                  <div>
                    <label>Mã sinh viên</label>
                    <strong>{selectedItem.maSv || "Chưa cập nhật"}</strong>
                  </div>

                  <div>
                    <label>Họ và tên</label>
                    <strong>{selectedItem.hoTenSinhVien || "Chưa cập nhật"}</strong>
                  </div>

                  <div>
                    <label>Email</label>
                    <strong>
                      <Mail size={15} />
                      {selectedItem.emailSinhVien || "Chưa cập nhật"}
                    </strong>
                  </div>

                  <div>
                    <label>Số điện thoại</label>
                    <strong>
                      <Phone size={15} />
                      {selectedItem.soDienThoaiSinhVien || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="tracking-detail-section">
                <h4>
                  <Building2 size={19} />
                  Thông tin doanh nghiệp
                </h4>

                <div className="tracking-detail-grid">
                  <div>
                    <label>Tên doanh nghiệp</label>
                    <strong>{selectedItem.tenDoanhNghiep || "Chưa cập nhật"}</strong>
                  </div>

                  <div>
                    <label>Mã doanh nghiệp</label>
                    <strong>{selectedItem.maDn || "Chưa cập nhật"}</strong>
                  </div>

                  <div className="tracking-detail-full">
                    <label>Địa chỉ</label>
                    <strong>
                      <MapPin size={15} />
                      {selectedItem.diaChiDoanhNghiep || "Chưa cập nhật"}
                    </strong>
                  </div>

                  <div>
                    <label>Vị trí thực tập</label>
                    <strong>{selectedItem.tenViTri || "Chưa cập nhật"}</strong>
                  </div>

                  <div>
                    <label>Số điện thoại doanh nghiệp</label>
                    <strong>
                      <Phone size={15} />
                      {selectedItem.soDienThoaiDoanhNghiep || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="tracking-detail-section">
                <h4>
                  <CalendarDays size={19} />
                  Thông tin quá trình
                </h4>

                <div className="tracking-detail-grid">
                  <div>
                    <label>Mã quá trình</label>
                    <strong>#{selectedItem.maQuaTrinh}</strong>
                  </div>

                  <div>
                    <label>Mã đăng ký</label>
                    <strong>#{selectedItem.maDangKy}</strong>
                  </div>

                  <div>
                    <label>Ngày bắt đầu</label>
                    <strong>{formatDate(selectedItem.ngayBatDau)}</strong>
                  </div>

                  <div>
                    <label>Ngày kết thúc</label>
                    <strong>{formatDate(selectedItem.ngayKetThuc)}</strong>
                  </div>

                  <div className="tracking-detail-full">
                    <label>Trạng thái</label>
                    <span className={`tracking-status ${getStatus(selectedItem.trangThai).className}`}>
                      {getStatus(selectedItem.trangThai).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tracking-progress-section">
                <div className="tracking-progress-heading">
                  <strong>Tiến độ theo thời gian</strong>
                  <span>
                    {calculateProgress(
                      selectedItem.ngayBatDau,
                      selectedItem.ngayKetThuc,
                      selectedItem.trangThai
                    )}%
                  </span>
                </div>

                <div className="tracking-progress-track">
                  <div
                    className="tracking-progress-value"
                    style={{
                      width: `${calculateProgress(
                        selectedItem.ngayBatDau,
                        selectedItem.ngayKetThuc,
                        selectedItem.trangThai
                      )}%`,
                    }}
                  />
                </div>

                <div className="tracking-latest-journal">
                  <label>
                    <ClipboardList size={16} />
                    Nội dung nhật ký mới nhất
                  </label>
                  <p>
                    {selectedItem.tienDo || "Chưa có nhật ký thực tập"}
                  </p>
                </div>
              </div>

            </div>

            <div className="tracking-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default InternshipTracking;
