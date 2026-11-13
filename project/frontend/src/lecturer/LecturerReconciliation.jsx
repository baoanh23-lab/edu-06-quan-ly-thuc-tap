
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  ClipboardCheck,
  Eye,
  X,
  Building2,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
} from "lucide-react";

import api from "../services/api";
import "../styles/LecturerReconciliation.css";

function formatDate(date) {
  if (!date) return "Chưa đối soát";

  return new Date(date).toLocaleDateString("vi-VN");
}

function formatScore(score) {
  if (score === null || score === undefined) return "--";
  return Number(score).toFixed(2);
}

function LecturerReconciliation() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [result, setResult] = useState("THONG_NHAT");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (content, type = "success") => {
    setMessage(content);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/doi-soat-danh-gia/giang-vien"
      );

      setList(response.data || []);
    } catch (error) {
      console.error(error);
      showMessage(
        error.response?.data?.message ||
          "Không thể tải danh sách đối soát.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let data = [...list];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      data = data.filter((item) =>
        `${item.maSv || ""} ${item.tenSinhVien || ""} ${item.maQuaTrinh || ""}`
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "CHUA_DOI_SOAT") {
        data = data.filter(
          (item) => item.trangThaiDoiSoat === "CHUA_DOI_SOAT"
        );
      } else {
        data = data.filter(
          (item) => item.trangThaiDoiSoat !== "CHUA_DOI_SOAT"
        );
      }
    }

    setFilteredList(data);
  }, [list, search, statusFilter]);

  const openDetail = async (item) => {
    try {
      setSelected(null);
      setDetailLoading(true);
      setComment("");
      setResult("THONG_NHAT");

      const response = await api.get(
        `/api/doi-soat-danh-gia/qua-trinh/${item.maQuaTrinh}`
      );

      setSelected(response.data);

      if (response.data.ketQua) {
        setResult(response.data.ketQua);
      }

      if (response.data.nhanXetDoiSoat) {
        setComment(response.data.nhanXetDoiSoat);
      }
    } catch (error) {
      console.error(error);
      showMessage(
        error.response?.data?.message ||
          "Không thể tải thông tin đánh giá.",
        "error"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;

    if (!result.trim()) {
      showMessage("Vui lòng chọn kết quả đối soát.", "error");
      return;
    }

    if (selected.maDoiSoat) {
      showMessage("Quá trình này đã được đối soát.", "error");
      return;
    }

    try {
      setSaving(true);

      await api.post(
        `/api/doi-soat-danh-gia/qua-trinh/${selected.maQuaTrinh}`,
        {
          ketQua: result,
          nhanXet: comment,
        }
      );

      showMessage("Đối soát đánh giá thành công!");

      setSelected(null);
      await loadData();
    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.message ||
          "Không thể lưu kết quả đối soát.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const total = list.length;

  const completed = list.filter(
    (item) => item.trangThaiDoiSoat !== "CHUA_DOI_SOAT"
  ).length;

  const pending = total - completed;

  return (
    <div className="reconciliation-page">
      <div className="reconciliation-header">
        <div>
          <h1>Đối soát đánh giá</h1>
          <p>
            Kiểm tra và đối chiếu kết quả đánh giá thực tập
            giữa doanh nghiệp và giảng viên.
          </p>
        </div>

        <button
          className="reconciliation-refresh"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Làm mới
        </button>
      </div>

      {message && (
        <div className={`reconciliation-toast ${messageType}`}>
          {messageType === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message}
        </div>
      )}

      <div className="reconciliation-stats">
        <div className="reconciliation-stat-card">
          <div className="reconciliation-stat-icon blue">
            <ClipboardCheck size={23} />
          </div>
          <div>
            <span>Tổng quá trình đủ đánh giá</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="reconciliation-stat-card">
          <div className="reconciliation-stat-icon orange">
            <AlertCircle size={23} />
          </div>
          <div>
            <span>Chưa đối soát</span>
            <strong>{pending}</strong>
          </div>
        </div>

        <div className="reconciliation-stat-card">
          <div className="reconciliation-stat-icon green">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <span>Đã đối soát</span>
            <strong>{completed}</strong>
          </div>
        </div>
      </div>

      <div className="reconciliation-content">
        <div className="reconciliation-toolbar">
          <div className="reconciliation-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm mã sinh viên, tên sinh viên, mã quá trình..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CHUA_DOI_SOAT">Chưa đối soát</option>
            <option value="DA_DOI_SOAT">Đã đối soát</option>
          </select>
        </div>

        <div className="reconciliation-table-wrapper">
          <table className="reconciliation-table">
            <thead>
              <tr>
                <th>Mã quá trình</th>
                <th>Sinh viên</th>
                <th>Trạng thái</th>
                <th>Ngày đối soát</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="reconciliation-empty">
                    <RefreshCw className="spin" size={22} />
                    <p>Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="reconciliation-empty">
                    <ClipboardCheck size={35} />
                    <p>Chưa có quá trình nào đủ điều kiện đối soát.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isDone =
                    item.trangThaiDoiSoat !== "CHUA_DOI_SOAT";

                  return (
                    <tr key={item.maQuaTrinh}>
                      <td>
                        <strong>QT{item.maQuaTrinh}</strong>
                      </td>

                      <td>
                        <div className="reconciliation-student">
                          <div className="reconciliation-avatar">
                            <GraduationCap size={19} />
                          </div>
                          <div>
                            <strong>
                              {item.tenSinhVien ||
                                "Sinh viên " + (item.maSv || "")}
                            </strong>
                            <span>{item.maSv || "Chưa cập nhật mã SV"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`reconciliation-status ${
                            isDone ? "done" : "pending"
                          }`}
                        >
                          {isDone ? "Đã đối soát" : "Chưa đối soát"}
                        </span>
                      </td>

                      <td>
                        {formatDate(item.ngayDoiSoat)}
                      </td>

                      <td>
                        <button
                          className="reconciliation-view-btn"
                          onClick={() => openDetail(item)}
                        >
                          <Eye size={16} />
                          {isDone ? "Xem kết quả" : "Đối soát"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="reconciliation-table-footer">
          Hiển thị {filteredList.length} / {total} quá trình
        </div>
      </div>

      {(detailLoading || selected) && (
        <div className="reconciliation-modal-overlay">
          <div className="reconciliation-modal">
            <div className="reconciliation-modal-header">
              <div>
                <h2>Chi tiết đối soát đánh giá</h2>
                <p>
                  Quá trình QT{selected?.maQuaTrinh || ""}
                </p>
              </div>

              <button
                className="reconciliation-close"
                onClick={() => setSelected(null)}
              >
                <X size={21} />
              </button>
            </div>

            {detailLoading ? (
              <div className="reconciliation-modal-loading">
                <RefreshCw className="spin" size={25} />
                <p>Đang tải thông tin...</p>
              </div>
            ) : selected && (
              <div className="reconciliation-modal-body">
                <div className="reconciliation-student-info">
                  <div className="reconciliation-avatar large">
                    <GraduationCap size={24} />
                  </div>

                  <div>
                    <strong>
                      {selected.tenSinhVien ||
                        "Sinh viên " + (selected.maSv || "")}
                    </strong>
                    <span>
                      Mã sinh viên: {selected.maSv || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="reconciliation-evaluation-grid">
                  <div className="reconciliation-evaluation-card">
                    <div className="reconciliation-evaluation-title">
                      <Building2 size={19} />
                      <strong>Đánh giá doanh nghiệp</strong>
                    </div>

                    <div className="reconciliation-score">
                      <Star size={21} />
                      <strong>
                        {formatScore(selected.diemDoanhNghiep)}
                      </strong>
                      <span>/ 10</span>
                    </div>

                    <div className="reconciliation-comment">
                      <span>Nhận xét</span>
                      <p>
                        {selected.nhanXetDoanhNghiep ||
                          "Không có nhận xét."}
                      </p>
                    </div>
                  </div>

                  <div className="reconciliation-evaluation-card lecturer">
                    <div className="reconciliation-evaluation-title">
                      <GraduationCap size={19} />
                      <strong>Đánh giá giảng viên</strong>
                    </div>

                    <div className="reconciliation-score">
                      <Star size={21} />
                      <strong>
                        {formatScore(selected.diemGiangVien)}
                      </strong>
                      <span>/ 10</span>
                    </div>

                    <div className="reconciliation-comment">
                      <span>Nhận xét</span>
                      <p>
                        {selected.nhanXetGiangVien ||
                          "Không có nhận xét."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="reconciliation-form">
                  <div className="reconciliation-form-heading">
                    <ClipboardCheck size={20} />
                    <h3>Kết quả đối soát</h3>
                  </div>

                  {selected.maDoiSoat ? (
                    <div className="reconciliation-result-view">
                      <div className="reconciliation-result-row">
                        <span>Kết quả</span>
                        <strong>{selected.ketQua}</strong>
                      </div>

                      <div className="reconciliation-result-row">
                        <span>Ngày đối soát</span>
                        <strong>
                          {formatDate(selected.ngayDoiSoat)}
                        </strong>
                      </div>

                      <div className="reconciliation-result-comment">
                        <span>Nhận xét đối soát</span>
                        <p>
                          {selected.nhanXetDoiSoat ||
                            "Không có nhận xét."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label>Kết quả đối soát</label>

                      <select
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                      >
                        <option value="THONG_NHAT">
                          Thống nhất kết quả đánh giá
                        </option>
                        <option value="CAN_XEM_XET">
                          Cần xem xét thêm
                        </option>
                      </select>

                      <label>Nhận xét của giảng viên</label>

                      <textarea
                        rows="4"
                        placeholder="Nhập nhận xét sau khi đối chiếu hai đánh giá..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />

                      <div className="reconciliation-form-note">
                        <AlertCircle size={16} />
                        Sau khi lưu, kết quả đối soát sẽ được ghi nhận
                        và không thể tạo lại cho quá trình này.
                      </div>

                      <button
                        className="reconciliation-submit"
                        onClick={handleSubmit}
                        disabled={saving}
                      >
                        <CheckCircle2 size={18} />
                        {saving ? "Đang lưu..." : "Xác nhận đối soát"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LecturerReconciliation;
