
import { useEffect, useMemo, useState, useCallback } from "react";

import {
  Search,
  Building2,
  MapPin,
  Users,
  ClipboardList,
  RefreshCw,
  BriefcaseBusiness,
  GraduationCap,
  X,
  Send,
  CheckCircle,
} from "lucide-react";

import api from "../services/api";
import "../styles/InternshipRegistration.css";

export default function InternshipRegistration() {
  const [student, setStudent] = useState(null);
  const [positions, setPositions] = useState([]);
  const [approvedLecturer, setApprovedLecturer] = useState(null);

  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lecturerError, setLecturerError] = useState("");

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [noiDung, setNoiDung] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // 1. LẤY HỒ SƠ SINH VIÊN
  // =====================================================

  const loadStudent = useCallback(async () => {
    const response = await api.get("/api/sinh-vien/ho-so");

    setStudent(response.data);

    return response.data;
  }, []);

  // =====================================================
  // 2. LẤY GIẢNG VIÊN ĐÃ ĐƯỢC DUYỆT
  // =====================================================

  const loadApprovedLecturer = useCallback(async () => {
    try {
      const response = await api.get(
        "/api/dang-ky-giang-vien/da-duyet"
      );

      const lecturer = response.data;

      if (lecturer && lecturer.maGv) {
        setApprovedLecturer(lecturer);
        setLecturerError("");
      } else {
        setApprovedLecturer(null);
        setLecturerError(
          "Bạn chưa có giảng viên hướng dẫn được duyệt."
        );
      }

      return lecturer;
    } catch (err) {
      console.error("Lỗi lấy giảng viên:", err);

      setApprovedLecturer(null);

      if (err.response?.status === 401) {
        setLecturerError(
          "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (err.response?.status === 403) {
        setLecturerError(
          "Bạn không có quyền xem thông tin giảng viên hướng dẫn."
        );
      } else {
        setLecturerError(
          err.response?.data?.message ||
          "Không thể tải thông tin giảng viên hướng dẫn."
        );
      }

      return null;
    }
  }, []);

  // =====================================================
  // 3. LẤY VỊ TRÍ THỰC TẬP PHÙ HỢP
  // =====================================================

  const loadPositions = useCallback(async (studentData = null) => {
    try {
      setLoading(true);
      setError("");

      let currentStudent = studentData;

      if (!currentStudent) {
        currentStudent = await loadStudent();
      }

      const maChuyenNganh =
        currentStudent?.chuyenNganh?.maChuyenNganh;

      if (!maChuyenNganh) {
        setPositions([]);
        setError("Thông tin chuyên ngành chưa được cập nhật.");
        return;
      }

      const response = await api.get(
        `/api/vi-tri-thuc-tap/phu-hop/${encodeURIComponent(
          maChuyenNganh
        )}`
      );

      setPositions(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Lỗi tải vị trí thực tập:", err);

      if (err.response?.status === 401) {
        setError(
          "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Bạn không có quyền truy cập chức năng này."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Không thể tải danh sách vị trí thực tập."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [loadStudent]);

  // =====================================================
  // 4. SINH VIÊN XEM ĐƠN ĐĂNG KÝ CỦA MÌNH
  // =====================================================

  const loadMyRegistrations = useCallback(async () => {
    try {
      setLoadingRegistrations(true);

      const response = await api.get(
        "/api/dang-ky-thuc-tap/cua-toi"
      );

      setMyRegistrations(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Lỗi tải đơn đăng ký:", err);

      if (err.response?.status === 401) {
        setMessage(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
        setMessageType("error");
      }
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  // =====================================================
  // 5. KHỞI TẠO DỮ LIỆU
  // =====================================================

  const loadInitialData = useCallback(async () => {
    try {
      const studentData = await loadStudent();

      await Promise.all([
        loadApprovedLecturer(),
        loadPositions(studentData),
        loadMyRegistrations(),
      ]);
    } catch (err) {
      console.error("Lỗi khởi tạo dữ liệu:", err);

      if (err.response?.status === 401) {
        setError(
          "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
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

      setLoading(false);
    }
  }, [
    loadStudent,
    loadApprovedLecturer,
    loadPositions,
    loadMyRegistrations,
  ]);

  useEffect(() => {
    loadInitialData();

    const intervalId = setInterval(() => {
      loadMyRegistrations();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadInitialData, loadMyRegistrations]);

  // =====================================================
  // 6. KIỂM TRA SINH VIÊN ĐÃ ĐƯỢC DOANH NGHIỆP NHẬN
  // =====================================================

  const daDuocDoanhNghiepNhan = useMemo(() => {
    return myRegistrations.some((item) => {
      const status = String(item.trangThaiDn || "")
        .trim()
        .toUpperCase();

      return [
        "CHAP_NHAN",
        "DA_DUYET",
        "DA_CHAP_NHAN",
        "DONG_Y",
      ].includes(status);
    });
  }, [myRegistrations]);

  // =====================================================
  // 7. LỌC VỊ TRÍ THỰC TẬP
  // =====================================================

  const filteredPositions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return positions;

    return positions.filter((item) =>
      [
        item.tenViTri,
        item.moTa,
        item.yeuCau,
        item.maDn,
        item.diaChi,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [positions, search]);

  // =====================================================
  // 8. MỞ HỘP THOẠI ĐĂNG KÝ
  // =====================================================

  const openRegisterModal = (position) => {
    if (daDuocDoanhNghiepNhan) {
      setMessage(
        "Bạn đã được doanh nghiệp chấp nhận thực tập. Không thể đăng ký thêm vị trí khác!"
      );
      setMessageType("error");
      return;
    }

    if (!approvedLecturer?.maGv) {
      setMessage(
        "Bạn chưa có giảng viên hướng dẫn được duyệt."
      );
      setMessageType("error");
      return;
    }

    setSelectedPosition(position);
    setNoiDung("");
    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // 9. ĐÓNG HỘP THOẠI
  // =====================================================

  const closeRegisterModal = () => {
    if (submitting) return;

    setSelectedPosition(null);
    setNoiDung("");
  };

  // =====================================================
  // 10. SINH VIÊN GỬI ĐƠN ĐĂNG KÝ
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedPosition) return;

    if (daDuocDoanhNghiepNhan) {
      setMessage(
        "Bạn đã được doanh nghiệp chấp nhận thực tập. Không thể đăng ký thêm vị trí khác."
      );
      setMessageType("error");
      return;
    }

    if (!approvedLecturer?.maGv) {
      setMessage(
        "Bạn chưa có giảng viên hướng dẫn được duyệt."
      );
      setMessageType("error");
      return;
    }

    if (!noiDung.trim()) {
      setMessage("Vui lòng nhập nội dung đăng ký.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("");

      await api.post("/api/dang-ky-thuc-tap", {
        maViTri: selectedPosition.maViTri,
        noiDung: noiDung.trim(),
      });

      setSelectedPosition(null);
      setNoiDung("");

      setMessage(
        "Đã gửi đăng ký thực tập thành công! Vui lòng chờ doanh nghiệp phản hồi."
      );
      setMessageType("success");

      await Promise.all([
        loadPositions(student),
        loadMyRegistrations(),
      ]);
    } catch (err) {
      console.error("Lỗi đăng ký:", err);

      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;

      if (status === 401) {
        setMessage(
          "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (status === 403) {
        setMessage(
          "Bạn không có quyền thực hiện chức năng này."
        );
      } else if (status === 409) {
        setMessage(
          "Bạn đã đăng ký vị trí thực tập này rồi."
        );
      } else {
        setMessage(
          serverMessage ||
          "Đăng ký thất bại. Vui lòng thử lại."
        );
      }

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // 11. XỬ LÝ TRẠNG THÁI ĐƠN
  // =====================================================

  const getRegistrationStatus = (item) => {
    const status = String(item.trangThaiDn || "CHO_DUYET")
      .trim()
      .toUpperCase();

    const acceptedStatuses = [
      "CHAP_NHAN",
      "DA_DUYET",
      "DA_CHAP_NHAN",
      "DONG_Y",
    ];

    const rejectedStatuses = [
      "TU_CHOI",
      "DA_TU_CHOI",
      "TU_CHOI_DANG_KY",
    ];

    if (acceptedStatuses.includes(status)) {
      return {
        statusText: "Doanh nghiệp đã chấp nhận",
        description:
          "Chúc mừng! Bạn đã được doanh nghiệp chọn thực tập.",
        statusClass: "my-internship-accepted",
        type: "accepted",
      };
    }

    if (rejectedStatuses.includes(status)) {
      return {
        statusText: "Đơn đăng ký bị từ chối",
        description:
          "Rất tiếc, doanh nghiệp chưa chấp nhận đơn đăng ký này.",
        statusClass: "my-internship-rejected",
        type: "rejected",
      };
    }

    return {
      statusText: "Đã gửi đăng ký thực tập",
      description:
        "Đơn của bạn đang chờ doanh nghiệp phản hồi.",
      statusClass: "my-internship-pending",
      type: "pending",
    };
  };

  // =====================================================
  // 12. LÀM MỚI TOÀN BỘ DỮ LIỆU
  // =====================================================

  const handleRefresh = async () => {
    setMessage("");
    setMessageType("");

    await Promise.all([
      loadApprovedLecturer(),
      loadMyRegistrations(),
      loadPositions(student),
    ]);
  };

  // =====================================================
  // 13. MÀN HÌNH ĐANG TẢI
  // =====================================================

  if (loading) {
    return (
      <div className="internship-message">
        <RefreshCw
          className="internship-loading-icon"
          size={22}
        />
        <p>Đang tải cơ hội thực tập...</p>
      </div>
    );
  }

  // =====================================================
  // 14. GIAO DIỆN CHÍNH
  // =====================================================

  return (
    <div className="internship-registration">

      {/* THÔNG BÁO */}
      {message && (
        <div
          className={`internship-notice ${
            messageType === "success"
              ? "internship-notice-success"
              : "internship-notice-error"
          }`}
        >
          {messageType === "success" && (
            <CheckCircle size={18} />
          )}

          <span>{message}</span>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setMessageType("");
            }}
            aria-label="Đóng thông báo"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* GIỚI THIỆU */}
      <section className="internship-intro">
        <div className="internship-intro-content">
          <div className="internship-heading">
            <span className="internship-label">
              CƠ HỘI THỰC TẬP
            </span>

            <span className="internship-sub-label">
              DÀNH CHO SINH VIÊN
            </span>
          </div>

          <h2>Khám phá cơ hội thực tập</h2>

          <p>
            Tìm kiếm vị trí thực tập phù hợp và lựa chọn
            môi trường phát triển kinh nghiệm chuyên môn
            tốt nhất cho bạn.
          </p>

          {student?.chuyenNganh && (
            <div className="internship-major">
              <GraduationCap size={16} />

              <span>Chuyên ngành:</span>

              <strong>
                {student.chuyenNganh.tenChuyenNganh}
              </strong>
            </div>
          )}
        </div>

        <div className="internship-intro-icon">
          <BriefcaseBusiness size={48} />
        </div>
      </section>

      {/* GIẢNG VIÊN HƯỚNG DẪN */}
      <section className="internship-approved-lecturer">
        <GraduationCap size={20} />

        {approvedLecturer?.maGv ? (
          <>
            <div>
              <span>
                Giảng viên hướng dẫn đã được duyệt
              </span>

              <strong>
                {approvedLecturer.maGv}
              </strong>
            </div>

            <CheckCircle size={19} />
          </>
        ) : (
          <div>
            <strong>
              Chưa có giảng viên hướng dẫn được duyệt
            </strong>

            <span>
              {lecturerError ||
                "Vui lòng đăng ký giảng viên hướng dẫn trước."}
            </span>
          </div>
        )}
      </section>

      {/* TRẠNG THÁI ĐƠN */}
      <section className="my-internship-registrations">
        <div className="my-internship-header">
          <div>
            <h3>Trạng thái đăng ký thực tập</h3>

            <p>
              Theo dõi kết quả phản hồi từ doanh nghiệp
            </p>
          </div>

          <button
            type="button"
            className="internship-refresh"
            onClick={handleRefresh}
            disabled={loadingRegistrations}
          >
            <RefreshCw
              size={15}
              className={
                loadingRegistrations
                  ? "internship-loading-icon"
                  : ""
              }
            />

            Làm mới
          </button>
        </div>

        {loadingRegistrations &&
        myRegistrations.length === 0 ? (
          <div className="my-internship-empty">
            <RefreshCw
              size={22}
              className="internship-loading-icon"
            />

            <p>Đang tải trạng thái đơn đăng ký...</p>
          </div>
        ) : myRegistrations.length === 0 ? (
          <div className="my-internship-empty">
            <ClipboardList size={28} />

            <p>
              Bạn chưa gửi đơn đăng ký thực tập nào.
            </p>
          </div>
        ) : (
          <div className="my-internship-list">
            {myRegistrations.map((item, index) => {
              const result = getRegistrationStatus(item);

              const positionName =
                item.tenViTri ||
                item.viTriThucTap?.tenViTri ||
                item.viTri?.tenViTri ||
                `Đơn đăng ký ${index + 1}`;

              return (
                <article
                  className="my-internship-card"
                  key={item.maDangKy ?? item.id ?? index}
                >
                  <div className="my-internship-card-top">
                    <div className="my-internship-card-icon">
                      {result.type === "accepted" ? (
                        <CheckCircle size={22} />
                      ) : result.type === "rejected" ? (
                        <X size={22} />
                      ) : (
                        <ClipboardList size={22} />
                      )}
                    </div>

                    <span
                      className={`my-internship-status ${result.statusClass}`}
                    >
                      {result.statusText}
                    </span>
                  </div>

                  <h4>{positionName}</h4>

                  {item.maDangKy != null && (
                    <p className="my-internship-code">
                      Mã đăng ký: {item.maDangKy}
                    </p>
                  )}

                  <p className="my-internship-description">
                    {result.description}
                  </p>

                  {result.type === "accepted" && (
                    <div className="my-internship-notification">
                      <CheckCircle size={18} />

                      <span>
                        Chúc mừng bạn! Hãy theo dõi thông tin
                        tiếp theo về kỳ thực tập.
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {daDuocDoanhNghiepNhan && (
        <div className="my-internship-notification">
          <CheckCircle size={20} />

          <div>
            <strong>
              Bạn đã được doanh nghiệp nhận thực tập!
            </strong>

            <p>
              Bạn không thể đăng ký thêm vị trí thực tập khác.
            </p>
          </div>
        </div>
      )}

      {/* DANH SÁCH VỊ TRÍ */}
      <section className="internship-toolbar">
        <div>
          <h3>Danh sách vị trí</h3>

          <p>
            Hiện có {positions.length} vị trí đang tuyển dụng
          </p>
        </div>

        <button
          className="internship-refresh"
          onClick={handleRefresh}
          type="button"
        >
          <RefreshCw size={15} />
          Làm mới
        </button>
      </section>

      {/* TÌM KIẾM */}
      <div className="internship-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Tìm theo tên vị trí, doanh nghiệp hoặc kỹ năng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* VỊ TRÍ THỰC TẬP */}
      {error ? (
        <div className="internship-message internship-error">
          <p>{error}</p>

          <button
            onClick={handleRefresh}
            type="button"
          >
            Thử lại
          </button>
        </div>
      ) : filteredPositions.length === 0 ? (
        <div className="internship-empty">
          <div className="internship-empty-icon">
            <ClipboardList size={32} />
          </div>

          <h3>Không tìm thấy vị trí phù hợp</h3>

          <p>
            {search
              ? "Không có kết quả khớp với từ khóa tìm kiếm của bạn."
              : "Chưa có doanh nghiệp tuyển dụng cho chuyên ngành này."}
          </p>
        </div>
      ) : (
        <section className="internship-grid">
          {filteredPositions.map((item) => (
            <article
              className="internship-card"
              key={item.maViTri}
            >
              <div className="internship-card-top">
                <div className="internship-card-icon">
                  <Building2 size={22} />
                </div>

                <span className="internship-status">
                  Đang tuyển
                </span>
              </div>

              <h3>{item.tenViTri}</h3>

              <div className="internship-company">
                <Building2 size={15} />

                <span>
                  Mã doanh nghiệp: {item.maDn}
                </span>
              </div>

              <div className="internship-card-info">
                <div>
                  <Users size={15} />

                  <span>
                    Tuyển: {item.soLuong}
                  </span>
                </div>

                <div>
                  <MapPin size={15} />

                  <span>
                    Địa điểm: {item.diaChi || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              <div className="internship-description">
                <strong>Mô tả công việc</strong>

                <p>
                  {item.moTa || "Đang cập nhật..."}
                </p>
              </div>

              <div className="internship-requirement">
                <strong>Yêu cầu ứng tuyển</strong>

                <p>
                  {item.yeuCau || "Đang cập nhật..."}
                </p>
              </div>

              <button
                className={`internship-register-button ${
                  daDuocDoanhNghiepNhan
                    ? "internship-register-disabled"
                    : ""
                }`}
                type="button"
                onClick={() => openRegisterModal(item)}
                disabled={
                  !approvedLecturer?.maGv ||
                  daDuocDoanhNghiepNhan
                }
                title={
                  daDuocDoanhNghiepNhan
                    ? "Bạn đã được doanh nghiệp nhận thực tập"
                    : !approvedLecturer?.maGv
                    ? "Bạn cần có giảng viên hướng dẫn được duyệt"
                    : "Đăng ký thực tập"
                }
              >
                <Send size={16} />

                {daDuocDoanhNghiepNhan
                  ? "Đã được nhận thực tập"
                  : approvedLecturer?.maGv
                  ? "Đăng ký thực tập"
                  : "Chưa có giảng viên được duyệt"}
              </button>
            </article>
          ))}
        </section>
      )}

      {/* HỘP THOẠI ĐĂNG KÝ */}
      {selectedPosition && (
        <div
          className="internship-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeRegisterModal();
            }
          }}
        >
          <div
            className="internship-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="internship-modal-title"
          >
            <div className="internship-modal-header">
              <div>
                <span>ĐĂNG KÝ THỰC TẬP</span>

                <h3 id="internship-modal-title">
                  {selectedPosition.tenViTri}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeRegisterModal}
                disabled={submitting}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="internship-modal-position">
                <Building2 size={17} />

                <span>
                  Mã doanh nghiệp: {selectedPosition.maDn}
                </span>
              </div>

              <div className="internship-modal-position">
                <GraduationCap size={17} />

                <span>
                  Giảng viên hướng dẫn: {approvedLecturer?.maGv}
                </span>

                <CheckCircle size={16} />
              </div>

              <label htmlFor="noiDungDangKy">
                Nội dung đăng ký <span>*</span>
              </label>

              <textarea
                id="noiDungDangKy"
                rows={5}
                placeholder="Giới thiệu ngắn gọn nguyện vọng và mong muốn của bạn khi ứng tuyển vị trí này..."
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                maxLength={2000}
                required
              />

              <div className="internship-modal-count">
                {noiDung.length}/2000 ký tự
              </div>

              {message && messageType === "error" && (
                <p className="internship-modal-error">
                  {message}
                </p>
              )}

              <div className="internship-modal-actions">
                <button
                  type="button"
                  className="internship-cancel-button"
                  onClick={closeRegisterModal}
                  disabled={submitting}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="internship-submit-button"
                  disabled={
                    submitting ||
                    !noiDung.trim() ||
                    !approvedLecturer?.maGv ||
                    daDuocDoanhNghiepNhan
                  }
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Gửi đăng ký
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
