
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Award,
  User,
  FileText,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  X,
  AlertCircle,
  ClipboardCheck,
  Building2,
  GraduationCap,
  Scale,
} from "lucide-react";

import "../styles/ConfirmResult.css";

const API_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("token");
}

async function requestApi(url, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || "Có lỗi xảy ra khi xử lý yêu cầu.";

    throw new Error(message);
  }

  return data;
}

function formatDate(value) {
  if (!value) return "Chưa có";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function formatScore(value) {
  if (value === null || value === undefined || value === "") {
    return "Chưa có";
  }

  return `${value}/10`;
}

function getStatusLabel(status) {
  if (status === "DA_XAC_NHAN") return "Đã xác nhận";
  if (status === "CHUA_XAC_NHAN") return "Chưa xác nhận";
  return status || "Chưa xác định";
}

export default function XacNhanKetQua() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detail, setDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [result, setResult] = useState("DAT");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await requestApi("/ket-qua/giang-vien");

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách kết quả:", err);
      setError(err.message || "Không thể tải danh sách sinh viên.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleViewDetail = async (student) => {
    try {
      setSelectedStudent(student);
      setDetail(null);
      setDetailLoading(true);
      setMessage("");
      setError("");

      const data = await requestApi(
        `/ket-qua/qua-trinh/${student.maQuaTrinh}`
      );

      setDetail(data);

      if (data?.ketQuaCuoiCung === "KHONG_DAT") {
        setResult("KHONG_DAT");
      } else {
        setResult("DAT");
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết kết quả:", err);
      setError(err.message || "Không thể tải thông tin chi tiết.");
      setSelectedStudent(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedStudent(null);
    setDetail(null);
    setMessage("");
    setError("");
  };

  const handleConfirm = async () => {
    if (!selectedStudent || !detail) return;

    if (detail.trangThai === "DA_XAC_NHAN") {
      setError("Kết quả này đã được xác nhận trước đó.");
      return;
    }

    const confirmed = window.confirm(
      `Bà có chắc chắn muốn xác nhận kết quả ${
        result === "DAT" ? "ĐẠT" : "KHÔNG ĐẠT"
      } cho sinh viên ${detail.maSv || selectedStudent.maSv || ""} không?`
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await requestApi(
        `/ket-qua/qua-trinh/${selectedStudent.maQuaTrinh}/xac-nhan`,
        {
          method: "POST",
          body: JSON.stringify({
            ketQua: result,
          }),
        }
      );

      setMessage("Xác nhận kết quả thực tập thành công.");

      await loadStudents();

      const updatedDetail = await requestApi(
        `/ket-qua/qua-trinh/${selectedStudent.maQuaTrinh}`
      );

      setDetail(updatedDetail);
    } catch (err) {
      console.error("Lỗi xác nhận kết quả:", err);
      setError(err.message || "Không thể xác nhận kết quả.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/bao-cao/${report.maBaoCao}/tai-xuong`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải báo cáo.");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = report.tenBaoCao || `bao-cao-${report.maBaoCao}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err.message || "Tải báo cáo thất bại.");
    }
  };

  const filteredStudents = students.filter((student) => {
    const keyword = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      String(student.maSv || "").toLowerCase().includes(keyword) ||
      String(student.maQuaTrinh || "").includes(keyword) ||
      String(student.maDangKy || "").includes(keyword);

    const matchesStatus =
      filterStatus === "ALL" ||
      student.trangThai === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = students.filter(
    (item) => item.trangThai !== "DA_XAC_NHAN"
  ).length;

  const confirmedCount = students.filter(
    (item) => item.trangThai === "DA_XAC_NHAN"
  ).length;

  return (
    <div className="confirm-result-page">
      {/* PAGE HEADING */}
      <div className="confirm-result-heading">
        <div>
          <span className="confirm-result-eyebrow">
            QUẢN LÝ KẾT QUẢ THỰC TẬP
          </span>

          <h2>Xác nhận kết quả thực tập</h2>

          <p>
            Kiểm tra đánh giá, đối soát và báo cáo trước khi xác nhận
            kết quả cuối cùng của sinh viên.
          </p>
        </div>

        <button
          type="button"
          className="confirm-refresh-button"
          onClick={loadStudents}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "spinning" : ""} />
          Làm mới
        </button>
      </div>

      {/* STATISTICS */}
      <div className="confirm-result-stats">
        <div className="confirm-result-stat">
          <div className="confirm-stat-icon blue">
            <UsersIcon />
          </div>
          <div>
            <span>Đủ điều kiện</span>
            <strong>{students.length}</strong>
          </div>
        </div>

        <div className="confirm-result-stat">
          <div className="confirm-stat-icon orange">
            <Clock size={22} />
          </div>
          <div>
            <span>Chờ xác nhận</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="confirm-result-stat">
          <div className="confirm-stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>Đã xác nhận</span>
            <strong>{confirmedCount}</strong>
          </div>
        </div>
      </div>

      {/* MESSAGE */}
      {error && (
        <div className="confirm-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {message && (
        <div className="confirm-alert success">
          <CheckCircle size={18} />
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="confirm-result-toolbar">
        <div className="confirm-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã sinh viên, mã quá trình..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="CHUA_XAC_NHAN">Chờ xác nhận</option>
          <option value="DA_XAC_NHAN">Đã xác nhận</option>
        </select>
      </div>

      {/* STUDENT LIST */}
      <div className="confirm-result-list">
        <div className="confirm-list-heading">
          <div>
            <h3>Danh sách sinh viên</h3>
            <p>
              Các sinh viên đã hoàn thành các bước đánh giá và đối soát,
              đồng thời có báo cáo được duyệt.
            </p>
          </div>

          <span className="confirm-total">
            {filteredStudents.length} sinh viên
          </span>
        </div>

        {loading ? (
          <div className="confirm-loading">
            <RefreshCw size={24} className="spinning" />
            <span>Đang tải danh sách...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="confirm-empty">
            <div className="confirm-empty-icon">
              <Award size={30} />
            </div>

            <strong>Chưa có sinh viên cần xác nhận</strong>

            <span>
              Sinh viên sẽ xuất hiện tại đây khi đã có đủ đánh giá,
              đối soát và báo cáo được duyệt.
            </span>
          </div>
        ) : (
          <div className="confirm-table-wrapper">
            <table className="confirm-table">
              <thead>
                <tr>
                  <th>Mã sinh viên</th>
                  <th>Mã quá trình</th>
                  <th>Trạng thái</th>
                  <th>Ngày xác nhận</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.maQuaTrinh}>
                    <td>
                      <div className="confirm-student-cell">
                        <div className="confirm-student-avatar">
                          <User size={18} />
                        </div>
                        <strong>{student.maSv || "Chưa có mã"}</strong>
                      </div>
                    </td>

                    <td>QT-{student.maQuaTrinh}</td>

                    <td>
                      <span
                        className={`confirm-status ${
                          student.trangThai === "DA_XAC_NHAN"
                            ? "completed"
                            : "pending"
                        }`}
                      >
                        {student.trangThai === "DA_XAC_NHAN" ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {getStatusLabel(student.trangThai)}
                      </span>
                    </td>

                    <td>{formatDate(student.ngayXacNhan)}</td>

                    <td>
                      <button
                        type="button"
                        className="confirm-view-button"
                        onClick={() => handleViewDetail(student)}
                      >
                        <Eye size={16} />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedStudent && (
        <div
          className="confirm-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCloseDetail();
          }}
        >
          <div className="confirm-modal">
            <div className="confirm-modal-header">
              <div>
                <span>CHI TIẾT KẾT QUẢ</span>
                <h2>Xác nhận kết quả thực tập</h2>
                <p>
                  Sinh viên: {detail?.maSv || selectedStudent.maSv || "Chưa có mã"}
                  {" · "}
                  Quá trình: QT-{selectedStudent.maQuaTrinh}
                </p>
              </div>

              <button
                type="button"
                className="confirm-modal-close"
                onClick={handleCloseDetail}
              >
                <X size={21} />
              </button>
            </div>

            {detailLoading ? (
              <div className="confirm-loading modal-loading">
                <RefreshCw size={24} className="spinning" />
                <span>Đang tải thông tin chi tiết...</span>
              </div>
            ) : detail ? (
              <div className="confirm-modal-body">
                {/* EVALUATIONS */}
                <div className="confirm-detail-section">
                  <div className="confirm-detail-title">
                    <div className="confirm-section-icon enterprise">
                      <Building2 size={19} />
                    </div>
                    <div>
                      <h3>Đánh giá của Doanh nghiệp</h3>
                      <span>Kết quả đánh giá từ đơn vị thực tập</span>
                    </div>
                  </div>

                  <div className="confirm-evaluation-card">
                    <div className="confirm-score">
                      <strong>
                        {formatScore(detail.diemDoanhNghiep)}
                      </strong>
                      <span>Điểm đánh giá</span>
                    </div>

                    <div className="confirm-comment">
                      <span>Nhận xét</span>
                      <p>
                        {detail.nhanXetDoanhNghiep || "Không có nhận xét"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="confirm-detail-section">
                  <div className="confirm-detail-title">
                    <div className="confirm-section-icon lecturer">
                      <GraduationCap size={19} />
                    </div>
                    <div>
                      <h3>Đánh giá của Giảng viên</h3>
                      <span>Kết quả đánh giá từ giảng viên phụ trách</span>
                    </div>
                  </div>

                  <div className="confirm-evaluation-card">
                    <div className="confirm-score">
                      <strong>
                        {formatScore(detail.diemGiangVien)}
                      </strong>
                      <span>Điểm đánh giá</span>
                    </div>

                    <div className="confirm-comment">
                      <span>Nhận xét</span>
                      <p>
                        {detail.nhanXetGiangVien || "Không có nhận xét"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RECONCILIATION */}
                <div className="confirm-detail-section">
                  <div className="confirm-detail-title">
                    <div className="confirm-section-icon reconciliation">
                      <Scale size={19} />
                    </div>
                    <div>
                      <h3>Kết quả đối soát</h3>
                      <span>Thông tin thống nhất giữa hai bên đánh giá</span>
                    </div>
                  </div>

                  <div className="confirm-reconciliation-card">
                    <div>
                      <span>Kết quả đối soát</span>
                      <strong>
                        {detail.ketQuaDoiSoat || "Chưa có thông tin"}
                      </strong>
                    </div>

                    <div>
                      <span>Nhận xét đối soát</span>
                      <p>
                        {detail.nhanXetDoiSoat || "Không có nhận xét"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* REPORTS */}
                <div className="confirm-detail-section">
                  <div className="confirm-detail-title">
                    <div className="confirm-section-icon report">
                      <FileText size={19} />
                    </div>
                    <div>
                      <h3>Báo cáo thực tập</h3>
                      <span>Danh sách báo cáo của sinh viên</span>
                    </div>
                  </div>

                  {Array.isArray(detail.baoCao) && detail.baoCao.length > 0 ? (
                    <div className="confirm-report-list">
                      {detail.baoCao.map((report) => (
                        <div
                          className="confirm-report-item"
                          key={report.maBaoCao}
                        >
                          <div className="confirm-report-info">
                            <FileText size={20} />
                            <div>
                              <strong>
                                {report.tenBaoCao || `Báo cáo ${report.maBaoCao}`}
                              </strong>
                              <span>
                                Nộp ngày: {formatDate(report.ngayNop)}
                              </span>
                            </div>
                          </div>

                          <div className="confirm-report-actions">
                            <span
                              className={`confirm-report-status ${
                                report.trangThai === "DA_DUYET"
                                  ? "approved"
                                  : "other"
                              }`}
                            >
                              {report.trangThai === "DA_DUYET"
                                ? "Đã duyệt"
                                : report.trangThai || "Chưa rõ"}
                            </span>

                            <button
                              type="button"
                              title="Tải báo cáo"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download size={17} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="confirm-no-report">
                      Chưa có báo cáo thực tập.
                    </div>
                  )}
                </div>

                {/* FINAL RESULT */}
                <div className="confirm-final-section">
                  <div className="confirm-detail-title">
                    <div className="confirm-section-icon final">
                      <Award size={19} />
                    </div>
                    <div>
                      <h3>Kết quả cuối cùng</h3>
                      <span>Giảng viên xác nhận kết quả thực tập</span>
                    </div>
                  </div>

                  {detail.trangThai === "DA_XAC_NHAN" ? (
                    <div className="confirm-already-done">
                      <CheckCircle size={22} />
                      <div>
                        <strong>
                          Đã xác nhận:{" "}
                          {detail.ketQuaCuoiCung === "DAT"
                            ? "ĐẠT"
                            : detail.ketQuaCuoiCung === "KHONG_DAT"
                              ? "KHÔNG ĐẠT"
                              : detail.ketQuaCuoiCung || "Đã xác nhận"}
                        </strong>
                        <span>
                          Ngày xác nhận: {formatDate(detail.ngayXacNhan)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="confirm-result-options">
                        <label
                          className={`confirm-result-option ${
                            result === "DAT" ? "selected pass" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="finalResult"
                            value="DAT"
                            checked={result === "DAT"}
                            onChange={(e) => setResult(e.target.value)}
                          />

                          <CheckCircle size={21} />

                          <span>
                            <strong>Đạt</strong>
                            <small>Sinh viên hoàn thành yêu cầu thực tập</small>
                          </span>
                        </label>

                        <label
                          className={`confirm-result-option ${
                            result === "KHONG_DAT" ? "selected fail" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="finalResult"
                            value="KHONG_DAT"
                            checked={result === "KHONG_DAT"}
                            onChange={(e) => setResult(e.target.value)}
                          />

                          <XCircle size={21} />

                          <span>
                            <strong>Không đạt</strong>
                            <small>Sinh viên chưa đáp ứng yêu cầu thực tập</small>
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        className="confirm-submit-button"
                        onClick={handleConfirm}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <RefreshCw size={18} className="spinning" />
                            Đang xác nhận...
                          </>
                        ) : (
                          <>
                            <ClipboardCheck size={18} />
                            Xác nhận kết quả
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="confirm-empty">
                Không tải được thông tin chi tiết.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersIcon() {
  return <User size={22} />;
}
