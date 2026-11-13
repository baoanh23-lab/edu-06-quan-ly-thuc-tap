
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
} from "lucide-react";

import api from "../services/api";
import "../styles/Lecturer.css";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // =====================================
  // LẤY ID YÊU CẦU
  // =====================================

  const getRequestId = (item) => {
    return (
      item.maDangKyGv ??
      item.id ??
      item.idDangKyGv ??
      null
    );
  };

  // =====================================
  // TẢI DANH SÁCH YÊU CẦU
  // =====================================

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        "/api/dang-ky-giang-vien/cua-giang-vien"
      );

      if (!Array.isArray(response.data)) {
        throw new Error("INVALID_DATA");
      }

      setStudents(response.data);

    } catch (err) {
      console.error("Lỗi tải yêu cầu đăng ký giảng viên:", err);

      const status = err.response?.status;

      if (status === 401) {
        setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      } else if (status === 403) {
        setError("Tài khoản hiện tại không có quyền giảng viên.");
      } else if (status === 404) {
        setError("Không tìm thấy API danh sách đăng ký giảng viên.");
      } else if (err.message === "INVALID_DATA") {
        setError("Dữ liệu API trả về không đúng định dạng.");
      } else {
        setError(
          err.response?.data?.message ||
          "Không thể tải dữ liệu. Hãy kiểm tra Spring Boot."
        );
      }

      setStudents([]);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // =====================================
  // DUYỆT YÊU CẦU
  // =====================================

  async function approveRequest(item) {
    const id = getRequestId(item);

    if (id == null) {
      alert("Không tìm thấy mã yêu cầu. Hãy kiểm tra entity DangKyGiangVien.");
      return;
    }

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn duyệt yêu cầu đăng ký giảng viên này không?"
    );

    if (!confirmed) return;

    setProcessingId(id);

    try {
      await api.put(
        `/api/dang-ky-giang-vien/${id}/duyet`
      );

      alert("Đã duyệt yêu cầu thành công!");

      await loadStudents();

    } catch (err) {
      console.error("Lỗi duyệt yêu cầu:", err);

      alert(
        err.response?.data?.message ||
        "Không thể duyệt yêu cầu. Vui lòng thử lại."
      );

    } finally {
      setProcessingId(null);
    }
  }

  // =====================================
  // TỪ CHỐI YÊU CẦU
  // =====================================

  async function rejectRequest(item) {
    const id = getRequestId(item);

    if (id == null) {
      alert("Không tìm thấy mã yêu cầu. Hãy kiểm tra entity DangKyGiangVien.");
      return;
    }

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn từ chối yêu cầu đăng ký giảng viên này không?"
    );

    if (!confirmed) return;

    setProcessingId(id);

    try {
      await api.put(
        `/api/dang-ky-giang-vien/${id}/tu-choi`
      );

      alert("Đã từ chối yêu cầu!");

      await loadStudents();

    } catch (err) {
      console.error("Lỗi từ chối yêu cầu:", err);

      alert(
        err.response?.data?.message ||
        "Không thể từ chối yêu cầu. Vui lòng thử lại."
      );

    } finally {
      setProcessingId(null);
    }
  }

  // =====================================
  // TÌM KIẾM
  // =====================================

  const filteredStudents = students.filter((item) => {
    const search = keyword.trim().toLowerCase();

    return (
      String(item.maSv ?? "").toLowerCase().includes(search) ||
      String(item.noiDung ?? "").toLowerCase().includes(search) ||
      String(item.trangThai ?? "").toLowerCase().includes(search)
    );
  });

  // =====================================
  // THỐNG KÊ
  // =====================================

  const pendingCount = students.filter(
    (item) => item.trangThai === "CHO_DUYET"
  ).length;

  const approvedCount = students.filter(
    (item) => item.trangThai === "DA_DUYET"
  ).length;

  const rejectedCount = students.filter(
    (item) => item.trangThai === "TU_CHOI"
  ).length;

  // =====================================
  // HIỂN THỊ TRẠNG THÁI
  // =====================================

  function renderStatus(status) {
    switch (status) {
      case "CHO_DUYET":
        return (
          <span className="request-status pending">
            <Clock size={14} />
            Chờ duyệt
          </span>
        );

      case "DA_DUYET":
        return (
          <span className="request-status approved">
            <CheckCircle size={14} />
            Đã duyệt
          </span>
        );

      case "TU_CHOI":
        return (
          <span className="request-status rejected">
            <XCircle size={14} />
            Đã từ chối
          </span>
        );

      default:
        return (
          <span className="request-status">
            {status || "Chưa xác định"}
          </span>
        );
    }
  }

  // =====================================
  // GIAO DIỆN
  // =====================================

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            QUẢN LÝ GIẢNG VIÊN HƯỚNG DẪN
          </p>

          <h1>Sinh viên đăng ký giảng viên</h1>

          <p>
            Quản lý và xử lý các yêu cầu đăng ký hướng dẫn thực tập.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadStudents}
          disabled={loading || processingId !== null}
        >
          <RefreshCw size={17} />
          {loading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      {/* THỐNG KÊ */}

      <div className="student-summary">
        <div className="summary-icon">
          <Users size={24} />
        </div>

        <div>
          <p>Tổng số yêu cầu</p>
          <h2>{students.length}</h2>
        </div>
      </div>

      <div className="request-summary-grid">
        <div className="request-summary-item">
          <Clock size={22} />
          <div>
            <p>Chờ duyệt</p>
            <h3>{pendingCount}</h3>
          </div>
        </div>

        <div className="request-summary-item">
          <CheckCircle size={22} />
          <div>
            <p>Đã duyệt</p>
            <h3>{approvedCount}</h3>
          </div>
        </div>

        <div className="request-summary-item">
          <XCircle size={22} />
          <div>
            <p>Đã từ chối</p>
            <h3>{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* DANH SÁCH */}

      <div className="student-list-card">
        <div className="student-list-toolbar">
          <div>
            <h2>Danh sách yêu cầu đăng ký</h2>
            <p>
              Các sinh viên đã gửi yêu cầu đến bạn.
            </p>
          </div>

          <div className="student-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Tìm mã sinh viên hoặc nội dung..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="student-message">
            Đang tải danh sách yêu cầu...
          </div>
        )}

        {error && (
          <div className="student-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="student-table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã sinh viên</th>
                    <th>Nội dung đăng ký</th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((item, index) => {
                    const id = getRequestId(item);
                    const isPending =
                      item.trangThai === "CHO_DUYET";

                    const isProcessing =
                      processingId === id;

                    return (
                      <tr key={id ?? index}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>{item.maSv ?? "—"}</strong>
                        </td>

                        <td>
                          {item.noiDung || "Không có nội dung"}
                        </td>

                        <td>
                          {item.ngayDangKy
                            ? new Date(
                                item.ngayDangKy
                              ).toLocaleDateString("vi-VN")
                            : "—"}
                        </td>

                        <td>
                          {renderStatus(item.trangThai)}
                        </td>

                        <td>
                          {isPending ? (
                            <div className="request-actions">
                              <button
                                className="request-approve-btn"
                                onClick={() => approveRequest(item)}
                                disabled={processingId !== null}
                              >
                                <CheckCircle size={15} />
                                {isProcessing ? "Đang xử lý..." : "Duyệt"}
                              </button>

                              <button
                                className="request-reject-btn"
                                onClick={() => rejectRequest(item)}
                                disabled={processingId !== null}
                              >
                                <XCircle size={15} />
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="request-completed">
                              Đã xử lý
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="student-message">
                {students.length === 0
                  ? (
                    <>
                      <GraduationCap size={30} />
                      <p>Chưa có sinh viên đăng ký bạn hướng dẫn.</p>
                    </>
                  )
                  : "Không tìm thấy yêu cầu phù hợp."}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
