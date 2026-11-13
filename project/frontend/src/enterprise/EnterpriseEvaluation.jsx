
import { useCallback, useEffect, useState } from "react";
import {
  Star,
  Search,
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  X,
  GraduationCap,
  CalendarDays,
  MessageSquare,
  Send,
  AlertCircle,
} from "lucide-react";

import "../styles/EnterpriseEvaluation.css";

const API_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("token");
}

async function requestApi(url, options = {}) {
  const token = getToken();

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
  if (!date) return "Chưa cập nhật";

  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN");
}

function EnterpriseEvaluation() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await requestApi("/danh-gia/doanh-nghiep");
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách sinh viên.");

      if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleOpenEvaluation = async (student) => {
    setError("");
    setSuccess("");

    try {
      const data = await requestApi(
        `/danh-gia/doanh-nghiep/qua-trinh/${student.maQuaTrinh}`
      );

      setSelectedStudent({
        ...student,
        ...data,
      });

      setScore(data.diem !== null && data.diem !== undefined
        ? String(data.diem)
        : "");

      setComment(data.noiDung || "");
    } catch (err) {
      setError(err.message || "Không thể tải thông tin đánh giá.");
    }
  };

  const closeModal = () => {
    if (submitting) return;

    setSelectedStudent(null);
    setScore("");
    setComment("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const diem = Number(score);

    if (score.trim() === "" || !Number.isFinite(diem) ||
        diem < 0 || diem > 10) {
      setError("Điểm đánh giá phải nằm trong khoảng từ 0 đến 10.");
      return;
    }

    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung nhận xét sinh viên.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await requestApi(
        `/danh-gia/doanh-nghiep/qua-trinh/${selectedStudent.maQuaTrinh}`,
        {
          method: "POST",
          body: JSON.stringify({
            diem,
            noiDung: comment.trim(),
          }),
        }
      );

      setSuccess("Đánh giá sinh viên thành công!");

      await loadStudents();

      const updated = await requestApi(
        `/danh-gia/doanh-nghiep/qua-trinh/${selectedStudent.maQuaTrinh}`
      );

      setSelectedStudent((previous) => ({
        ...previous,
        ...updated,
      }));

      setScore(String(updated.diem ?? diem));
      setComment(updated.noiDung || comment);
    } catch (err) {
      setError(err.message || "Không thể gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      String(student.maSv || "").toLowerCase().includes(keyword) ||
      String(student.tenSinhVien || "").toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "ALL" ||
      (filter === "DONE" && student.daDanhGia) ||
      (filter === "PENDING" && !student.daDanhGia);

    return matchesSearch && matchesFilter;
  });

  const total = students.length;
  const evaluated = students.filter((item) => item.daDanhGia).length;
  const pending = total - evaluated;

  return (
    <div className="enterprise-evaluation">
      <div className="ee-heading">
        <div>
          <h2>Đánh giá sinh viên thực tập</h2>
          <p>
            Theo dõi và đánh giá kết quả thực tập của sinh viên
            tại doanh nghiệp.
          </p>
        </div>

        <button
          className="ee-refresh"
          onClick={loadStudents}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "ee-spin" : ""} />
          Làm mới
        </button>
      </div>

      <div className="ee-stats">
        <div className="ee-stat-card">
          <div className="ee-stat-icon blue">
            <Users size={23} />
          </div>
          <div>
            <span>Tổng sinh viên</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="ee-stat-card">
          <div className="ee-stat-icon orange">
            <Clock size={23} />
          </div>
          <div>
            <span>Chờ đánh giá</span>
            <strong>{pending}</strong>
          </div>
        </div>

        <div className="ee-stat-card">
          <div className="ee-stat-icon green">
            <CheckCircle size={23} />
          </div>
          <div>
            <span>Đã đánh giá</span>
            <strong>{evaluated}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="ee-alert error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="ee-alert success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="ee-toolbar">
        <div className="ee-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên sinh viên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="ALL">Tất cả sinh viên</option>
          <option value="PENDING">Chờ đánh giá</option>
          <option value="DONE">Đã đánh giá</option>
        </select>
      </div>

      <div className="ee-list-card">
        <div className="ee-list-heading">
          <div>
            <h3>Danh sách sinh viên</h3>
            <p>{filteredStudents.length} sinh viên được tìm thấy</p>
          </div>
        </div>

        {loading ? (
          <div className="ee-state">
            <RefreshCw size={28} className="ee-spin" />
            <p>Đang tải danh sách sinh viên...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="ee-state">
            <GraduationCap size={38} />
            <h3>Chưa có sinh viên phù hợp</h3>
            <p>Danh sách sinh viên thực tập sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="ee-table-wrap">
            <table className="ee-table">
              <thead>
                <tr>
                  <th>Thông tin sinh viên</th>
                  <th>Thời gian thực tập</th>
                  <th>Trạng thái đánh giá</th>
                  <th>Điểm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.maQuaTrinh}>
                    <td>
                      <div className="ee-student">
                        <div className="ee-avatar">
                          <GraduationCap size={21} />
                        </div>
                        <div>
                          <strong>
                            {student.tenSinhVien || "Sinh viên"}
                          </strong>
                          <span>MSSV: {student.maSv}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="ee-date">
                        <CalendarDays size={16} />
                        <span>
                          {formatDate(student.ngayBatDau)}
                          <br />
                          đến {formatDate(student.ngayKetThuc)}
                        </span>
                      </div>
                    </td>

                    <td>
                      {student.daDanhGia ? (
                        <span className="ee-status done">
                          <CheckCircle size={15} />
                          Đã đánh giá
                        </span>
                      ) : (
                        <span className="ee-status pending">
                          <Clock size={15} />
                          Chờ đánh giá
                        </span>
                      )}
                    </td>

                    <td>
                      <strong className="ee-score">
                        {student.daDanhGia
                          ? `${student.diem}/10`
                          : "Chưa có"}
                      </strong>
                    </td>

                    <td>
                      <button
                        className={`ee-action ${
                          student.daDanhGia ? "view" : "evaluate"
                        }`}
                        onClick={() => handleOpenEvaluation(student)}
                      >
                        <Star size={16} />
                        {student.daDanhGia ? "Xem đánh giá" : "Đánh giá"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="ee-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <div className="ee-modal">
            <div className="ee-modal-header">
              <div>
                <span>ĐÁNH GIÁ THỰC TẬP</span>
                <h3>
                  {selectedStudent.tenSinhVien || "Sinh viên"}
                </h3>
                <p>Mã sinh viên: {selectedStudent.maSv}</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ee-modal-body">
                {selectedStudent.daDanhGia && (
                  <div className="ee-readonly-note">
                    <CheckCircle size={17} />
                    Sinh viên này đã được doanh nghiệp đánh giá.
                  </div>
                )}

                <div className="ee-field">
                  <label>Điểm đánh giá (0–10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.25"
                    value={score}
                    onChange={(event) => setScore(event.target.value)}
                    placeholder="Nhập điểm đánh giá"
                    disabled={selectedStudent.daDanhGia}
                    required
                  />
                </div>

                <div className="ee-field">
                  <label>Nội dung nhận xét</label>
                  <textarea
                    rows="5"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Nhập nhận xét về thái độ, kỹ năng và kết quả thực tập..."
                    disabled={selectedStudent.daDanhGia}
                    required
                  />
                </div>

                {selectedStudent.daDanhGia && (
                  <p className="ee-evaluated-date">
                    Thời gian đánh giá:{" "}
                    {selectedStudent.ngayDanhGia
                      ? new Date(selectedStudent.ngayDanhGia)
                          .toLocaleString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div className="ee-modal-actions">
                <button
                  type="button"
                  className="ee-cancel"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Đóng
                </button>

                {!selectedStudent.daDanhGia && (
                  <button
                    type="submit"
                    className="ee-submit"
                    disabled={submitting}
                  >
                    <Send size={17} />
                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterpriseEvaluation;
