
import { useEffect, useMemo, useState, useCallback } from "react";

import {
  Search,
  GraduationCap,
  UserRound,
  Send,
  RefreshCw,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import "../styles/LecturerRegistration.css";

// =====================================================
// 1. CHUẨN HÓA TRẠNG THÁI
// =====================================================

const normalizeStatus = (status) => {
  return String(status || "CHO_DUYET")
    .trim()
    .toUpperCase();
};

// =====================================================
// 2. HIỂN THỊ TRẠNG THÁI
// =====================================================

const getStatusInfo = (status) => {
  const currentStatus = normalizeStatus(status);

  switch (currentStatus) {
    case "DA_DUYET":
      return {
        label: "Đã duyệt",
        className: "approved",
        icon: CheckCircle,
      };

    case "TU_CHOI":
      return {
        label: "Đã từ chối",
        className: "rejected",
        icon: XCircle,
      };

    default:
      return {
        label: "Chờ duyệt",
        className: "pending",
        icon: Clock,
      };
  }
};

// =====================================================
// 3. COMPONENT CHÍNH
// =====================================================

export default function LecturerRegistration() {
  const [lecturers, setLecturers] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [noiDung, setNoiDung] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // 4. TẢI DANH SÁCH GIẢNG VIÊN VÀ YÊU CẦU ĐÃ GỬI
  // =====================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [lecturerResponse, registrationResponse] =
        await Promise.all([
          api.get("/api/giang-vien/danh-sach"),
          api.get("/api/dang-ky-giang-vien/cua-toi"),
        ]);

      setLecturers(
        Array.isArray(lecturerResponse.data)
          ? lecturerResponse.data
          : []
      );

      setRegistrations(
        Array.isArray(registrationResponse.data)
          ? registrationResponse.data
          : []
      );
    } catch (err) {
      console.error(
        "Lỗi tải dữ liệu đăng ký giảng viên:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Bạn không có quyền truy cập chức năng này."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Không thể tải dữ liệu. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =====================================================
  // 5. TÌM KIẾM GIẢNG VIÊN
  // =====================================================

  const filteredLecturers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return lecturers;

    return lecturers.filter((item) =>
      [item.maGv, item.hoTen, item.email]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [lecturers, search]);

  // =====================================================
  // 6. LẤY YÊU CẦU MỚI NHẤT CỦA TỪNG GIẢNG VIÊN
  // =====================================================

  const latestRegistrationByLecturer = useMemo(() => {
    const result = new Map();

    registrations.forEach((item) => {
      const lecturerId = String(item.maGv);

      const current = result.get(lecturerId);

      if (!current) {
        result.set(lecturerId, item);
        return;
      }

      const currentId = Number(current.maDangKyGv || 0);
      const newId = Number(item.maDangKyGv || 0);

      const currentDate = new Date(
        current.ngayDangKy || 0
      ).getTime();

      const newDate = new Date(
        item.ngayDangKy || 0
      ).getTime();

      // Ưu tiên mã yêu cầu lớn hơn để xác định yêu cầu mới nhất.
      // Nếu không có mã thì so sánh ngày đăng ký.
      const isNewer =
        newId > 0 && currentId > 0
          ? newId > currentId
          : newDate > currentDate;

      if (isNewer) {
        result.set(lecturerId, item);
      }
    });

    return result;
  }, [registrations]);

  // =====================================================
  // 7. KIỂM TRA CÓ ĐƯỢC ĐĂNG KÝ GIẢNG VIÊN KHÔNG
  // =====================================================

  const getLecturerRegistrationState = (maGv) => {
    const latestRequest =
      latestRegistrationByLecturer.get(String(maGv));

    // Chưa từng gửi yêu cầu
    if (!latestRequest) {
      return {
        canRegister: true,
        label: "Đăng ký hướng dẫn",
        type: "new",
      };
    }

    const status = normalizeStatus(
      latestRequest.trangThai
    );

    // Đã được giảng viên duyệt
    if (status === "DA_DUYET") {
      return {
        canRegister: false,
        label: "Đã được duyệt",
        type: "approved",
      };
    }

    // Giảng viên đã từ chối: cho phép đăng ký lại
    if (status === "TU_CHOI") {
      return {
        canRegister: true,
        label: "Đăng ký lại hướng dẫn",
        type: "rejected",
      };
    }

    // Đang chờ giảng viên phản hồi
    return {
      canRegister: false,
      label: "Đã gửi yêu cầu",
      type: "pending",
    };
  };

  // =====================================================
  // 8. MỞ HỘP THOẠI ĐĂNG KÝ
  // =====================================================

  const openModal = (lecturer) => {
    const state = getLecturerRegistrationState(
      lecturer.maGv
    );

    if (!state.canRegister) {
      return;
    }

    setSelectedLecturer(lecturer);
    setNoiDung("");
    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // 9. ĐÓNG HỘP THOẠI
  // =====================================================

  const closeModal = () => {
    if (submitting) return;

    setSelectedLecturer(null);
    setNoiDung("");
    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // 10. GỬI YÊU CẦU ĐĂNG KÝ GIẢNG VIÊN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLecturer) return;

    if (!noiDung.trim()) {
      setMessage(
        "Vui lòng nhập lời nhắn đến giảng viên."
      );
      setMessageType("error");
      return;
    }

    // Kiểm tra lại trạng thái trước khi gửi
    const currentState = getLecturerRegistrationState(
      selectedLecturer.maGv
    );

    if (!currentState.canRegister) {
      setMessage(
        "Yêu cầu đăng ký đang chờ duyệt hoặc đã được duyệt."
      );
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("");

      const response = await api.post(
        "/api/dang-ky-giang-vien",
        {
          maGv: selectedLecturer.maGv,
          noiDung: noiDung.trim(),
        }
      );

      setSelectedLecturer(null);
      setNoiDung("");

      setMessage(
        response.data?.message ||
        "Đã gửi yêu cầu đăng ký giảng viên thành công!"
      );

      setMessageType("success");

      // Tải lại danh sách sau khi gửi thành công
      await loadData();
    } catch (err) {
      console.error("Lỗi gửi yêu cầu:", err);

      const status = err.response?.status;

      if (status === 401) {
        setMessage(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (status === 403) {
        setMessage(
          "Bạn không có quyền thực hiện chức năng này."
        );
      } else {
        setMessage(
          err.response?.data?.message ||
          "Không thể gửi yêu cầu. Vui lòng thử lại."
        );
      }

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // 11. MÀN HÌNH ĐANG TẢI
  // =====================================================

  if (loading) {
    return (
      <div className="lecturer-message">
        <RefreshCw
          size={22}
          className="lecturer-loading-icon"
        />

        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // =====================================================
  // 12. GIAO DIỆN CHÍNH
  // =====================================================

  return (
    <div className="lecturer-registration">

      {/* THÔNG BÁO */}
      {message && (
        <div
          className={`lecturer-form-message ${messageType}`}
        >
          <span>{message}</span>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setMessageType("");
            }}
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* GIỚI THIỆU */}
      <section className="lecturer-intro">
        <div>
          <span className="lecturer-label">
            GIẢNG VIÊN HƯỚNG DẪN
          </span>

          <h2>Đăng ký giảng viên hướng dẫn</h2>

          <p>
            Tìm kiếm và gửi yêu cầu đến giảng viên mà bạn
            mong muốn đồng hành trong quá trình thực tập.
          </p>
        </div>

        <GraduationCap size={48} />
      </section>

      {/* LỖI TẢI DỮ LIỆU */}
      {error && (
        <div className="lecturer-empty">
          <p>{error}</p>

          <button
            type="button"
            onClick={loadData}
          >
            Thử lại
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* DANH SÁCH GIẢNG VIÊN */}
          <section className="lecturer-toolbar">
            <div>
              <h3>Danh sách giảng viên</h3>

              <p>
                Hiện có {lecturers.length} giảng viên
              </p>
            </div>

            <button
              type="button"
              className="lecturer-refresh"
              onClick={loadData}
            >
              <RefreshCw size={15} />
              Làm mới
            </button>
          </section>

          {/* TÌM KIẾM */}
          <div className="lecturer-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Tìm theo mã, tên hoặc email giảng viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* THẺ GIẢNG VIÊN */}
          {filteredLecturers.length === 0 ? (
            <div className="lecturer-empty">
              <UserRound size={32} />

              <h3>Không tìm thấy giảng viên</h3>

              <p>
                Vui lòng thử lại với từ khóa khác.
              </p>
            </div>
          ) : (
            <section className="lecturer-grid">
              {filteredLecturers.map((lecturer) => {
                const registrationState =
                  getLecturerRegistrationState(
                    lecturer.maGv
                  );

                return (
                  <article
                    className="lecturer-card"
                    key={lecturer.maGv}
                  >
                    <div className="lecturer-card-icon">
                      <GraduationCap size={25} />
                    </div>

                    <h3>{lecturer.hoTen}</h3>

                    <p className="lecturer-code">
                      Mã giảng viên: {lecturer.maGv}
                    </p>

                    <p className="lecturer-email">
                      {lecturer.email ||
                        "Chưa cập nhật email"}
                    </p>

                    <button
                      type="button"
                      className="lecturer-register-button"
                      onClick={() => openModal(lecturer)}
                      disabled={!registrationState.canRegister}
                    >
                      {registrationState.type === "approved" ? (
                        <>
                          <CheckCircle size={16} />
                          Đã được duyệt
                        </>
                      ) : registrationState.type === "pending" ? (
                        <>
                          <Clock size={16} />
                          Đã gửi yêu cầu
                        </>
                      ) : registrationState.type === "rejected" ? (
                        <>
                          <Send size={16} />
                          Đăng ký lại hướng dẫn
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Đăng ký hướng dẫn
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </section>
          )}

          {/* LỊCH SỬ YÊU CẦU */}
          <section className="lecturer-history">
            <div className="lecturer-toolbar">
              <div>
                <h3>Yêu cầu đăng ký đã gửi</h3>

                <p>
                  Bạn đã gửi {registrations.length} yêu cầu
                </p>
              </div>
            </div>

            {registrations.length === 0 ? (
              <div className="lecturer-empty">
                <Clock size={30} />

                <p>
                  Bạn chưa gửi yêu cầu đăng ký giảng viên nào.
                </p>
              </div>
            ) : (
              <div className="lecturer-history-list">
                {registrations.map((item, index) => {
                  const status = getStatusInfo(
                    item.trangThai
                  );

                  const StatusIcon = status.icon;

                  const lecturer = lecturers.find(
                    (gv) =>
                      String(gv.maGv) === String(item.maGv)
                  );

                  return (
                    <article
                      className="lecturer-history-item"
                      key={
                        item.maDangKyGv ??
                        `${item.maGv}-${index}`
                      }
                    >
                      <div>
                        <h4>
                          {lecturer?.hoTen ||
                            `Giảng viên ${item.maGv}`}
                        </h4>

                        <p>
                          Mã giảng viên: {item.maGv}
                        </p>

                        {item.ngayDangKy && (
                          <p>
                            Ngày đăng ký: {item.ngayDangKy}
                          </p>
                        )}

                        {item.noiDung && (
                          <p className="lecturer-history-content">
                            Lời nhắn: {item.noiDung}
                          </p>
                        )}
                      </div>

                      <span
                        className={`lecturer-status ${status.className}`}
                      >
                        <StatusIcon size={15} />
                        {status.label}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* HỘP THOẠI GỬI YÊU CẦU */}
      {selectedLecturer && (
        <div
          className="lecturer-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="lecturer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lecturer-modal-title"
          >
            <div className="lecturer-modal-header">
              <div>
                <span>GỬI YÊU CẦU HƯỚNG DẪN</span>

                <h3 id="lecturer-modal-title">
                  {selectedLecturer.hoTen}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Giảng viên được chọn
              </label>

              <div className="lecturer-selected-info">
                {selectedLecturer.maGv} -{" "}
                {selectedLecturer.hoTen}
              </div>

              <label htmlFor="noiDung">
                Lời nhắn đến giảng viên <span>*</span>
              </label>

              <textarea
                id="noiDung"
                rows={5}
                maxLength={2000}
                value={noiDung}
                onChange={(e) =>
                  setNoiDung(e.target.value)
                }
                placeholder="Trình bày nguyện vọng và mong muốn được giảng viên hướng dẫn..."
                required
              />

              <div className="lecturer-count">
                {noiDung.length}/2000 ký tự
              </div>

              {message && messageType === "error" && (
                <p className="lecturer-form-message error">
                  {message}
                </p>
              )}

              <div className="lecturer-modal-actions">
                <button
                  type="button"
                  className="lecturer-cancel-button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="lecturer-submit-button"
                  disabled={
                    submitting || !noiDung.trim()
                  }
                >
                  <Send size={16} />

                  {submitting
                    ? "Đang gửi..."
                    : "Gửi yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
