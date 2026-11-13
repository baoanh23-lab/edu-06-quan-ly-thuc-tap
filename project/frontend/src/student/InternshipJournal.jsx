
import { useEffect, useState } from "react";
import {
  CalendarDays,
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  CheckCircle,
  Clock3,
  BriefcaseBusiness,
} from "lucide-react";

import api from "../services/api";
import "../styles/InternshipJournal.css";

// =====================================
// FORMAT NGÀY
// =====================================

function formatDate(date) {
  if (!date) return "Chưa cập nhật";

  return new Date(date + "T00:00:00").toLocaleDateString("vi-VN");
}

// =====================================
// TRẠNG THÁI QUÁ TRÌNH
// =====================================

function getStatusInfo(status) {
  switch (status) {
    case "CHUA_BAT_DAU":
      return {
        label: "Chưa bắt đầu",
        className: "not-started",
      };

    case "DANG_THUC_TAP":
      return {
        label: "Đang thực tập",
        className: "in-progress",
      };

    case "HOAN_THANH":
      return {
        label: "Hoàn thành",
        className: "completed",
      };

    default:
      return {
        label: status || "Chưa cập nhật",
        className: "not-started",
      };
  }
}

export default function InternshipJournal() {
  const [processes, setProcesses] = useState([]);
  const [journals, setJournals] = useState([]);

  const [selectedProcess, setSelectedProcess] = useState("");
  const [keyword, setKeyword] = useState("");

  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [loadingJournals, setLoadingJournals] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ngay: new Date().toLocaleDateString("en-CA"),
    noiDung: "",
  });

  // =====================================
  // LẤY DANH SÁCH QUÁ TRÌNH THỰC TẬP
  // =====================================

  const loadProcesses = async () => {
    try {
      setLoadingProcesses(true);
      setError("");

      const response = await api.get(
        "/api/qua-trinh-thuc-tap/cua-toi"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setProcesses(data);

      if (data.length === 0) {
        setSelectedProcess("");
        setJournals([]);
      } else {
        setSelectedProcess((current) => {
          const exists = data.some(
            (item) =>
              String(item.maQuaTrinh) === String(current)
          );

          return exists
            ? current
            : String(data[0].maQuaTrinh);
        });
      }
    } catch (err) {
      console.error("Lỗi tải quá trình thực tập:", err);

      if (err.response?.status === 401) {
        setError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Bạn không có quyền xem quá trình thực tập."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Không thể tải danh sách quá trình thực tập."
        );
      }
    } finally {
      setLoadingProcesses(false);
    }
  };

  // =====================================
  // LẤY NHẬT KÝ THEO QUÁ TRÌNH
  // =====================================

  const loadJournals = async (processId) => {
    if (!processId) {
      setJournals([]);
      return;
    }

    try {
      setLoadingJournals(true);
      setError("");

      const response = await api.get(
        `/api/nhat-ky/qua-trinh/${processId}`
      );

      setJournals(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Lỗi tải nhật ký:", err);

      setJournals([]);

      setError(
        err.response?.data?.message ||
        "Không thể tải nhật ký thực tập."
      );
    } finally {
      setLoadingJournals(false);
    }
  };

  // =====================================
  // KHỞI TẠO
  // =====================================

  useEffect(() => {
    loadProcesses();
  }, []);

  useEffect(() => {
    if (selectedProcess) {
      loadJournals(selectedProcess);
    } else {
      setJournals([]);
    }
  }, [selectedProcess]);

  // =====================================
  // MỞ FORM THÊM
  // =====================================

  const openAddForm = () => {
    setIsEditing(false);
    setSelectedJournalId(null);

    setForm({
      ngay: new Date().toLocaleDateString("en-CA"),
      noiDung: "",
    });

    setError("");
    setShowForm(true);
  };

  // =====================================
  // MỞ FORM SỬA
  // =====================================

  const openEditForm = (journal) => {
    setIsEditing(true);
    setSelectedJournalId(journal.maNhatKy);

    setForm({
      ngay: journal.ngay || "",
      noiDung: journal.noiDung || "",
    });

    setError("");
    setShowForm(true);
  };

  // =====================================
  // THÊM / CẬP NHẬT NHẬT KÝ
  // =====================================

  const saveJournal = async (e) => {
    e.preventDefault();

    if (!selectedProcess) {
      setError("Vui lòng chọn quá trình thực tập.");
      return;
    }

    if (!form.ngay || !form.noiDung.trim()) {
      setError("Vui lòng nhập đầy đủ ngày và nội dung.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ngay: form.ngay,
        noiDung: form.noiDung.trim(),
      };

      if (isEditing) {
        await api.put(
          `/api/nhat-ky/${selectedJournalId}`,
          payload
        );

        setSuccess("Cập nhật nhật ký thành công!");
      } else {
        await api.post(
          `/api/nhat-ky/${selectedProcess}`,
          payload
        );

        setSuccess("Thêm nhật ký thực tập thành công!");
      }

      setShowForm(false);

      await loadJournals(selectedProcess);
    } catch (err) {
      console.error("Lỗi lưu nhật ký:", err);

      setError(
        err.response?.data?.message ||
        "Không thể lưu nhật ký. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // XÓA NHẬT KÝ
  // =====================================

  const deleteJournal = async (journalId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa nhật ký này không?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/api/nhat-ky/${journalId}`);

      setSuccess("Xóa nhật ký thành công!");

      await loadJournals(selectedProcess);
    } catch (err) {
      console.error("Lỗi xóa nhật ký:", err);

      setError(
        err.response?.data?.message ||
        "Không thể xóa nhật ký."
      );
    }
  };

  // =====================================
  // LỌC DANH SÁCH
  // =====================================

  const filteredJournals = journals.filter((item) =>
    (item.noiDung || "")
      .toLowerCase()
      .includes(keyword.toLowerCase())
  );

  const currentProcess = processes.find(
    (item) =>
      String(item.maQuaTrinh) === String(selectedProcess)
  );

  // =====================================
  // GIAO DIỆN LOADING
  // =====================================

  if (loadingProcesses) {
    return (
      <div className="nk-empty">
        <RefreshCw className="nk-spin" size={28} />
        <p>Đang tải quá trình thực tập...</p>
      </div>
    );
  }

  // =====================================
  // GIAO DIỆN CHÍNH
  // =====================================

  return (
    <div className="nk-page">

      {/* HEADER */}

      <div className="nk-header">
        <div>
          <div className="nk-breadcrumb">
            Sinh viên / Nhật ký thực tập
          </div>

          <h1>Nhật ký thực tập</h1>

          <p>
            Ghi nhận và theo dõi các hoạt động trong quá trình thực tập.
          </p>
        </div>

        <button
          className="nk-btn-primary"
          onClick={openAddForm}
          disabled={!selectedProcess}
        >
          <Plus size={18} />
          Thêm nhật ký
        </button>
      </div>

      {/* THÔNG BÁO */}

      {success && (
        <div className="nk-alert nk-success">
          <CheckCircle size={18} />
          <span>{success}</span>

          <button onClick={() => setSuccess("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="nk-alert nk-error">
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* THỐNG KÊ */}

      <div className="nk-stats">
        <div className="nk-stat-card">
          <div className="nk-stat-icon blue">
            <BookOpen size={23} />
          </div>

          <div>
            <span>Tổng số nhật ký</span>
            <strong>{journals.length}</strong>
          </div>
        </div>

        <div className="nk-stat-card">
          <div className="nk-stat-icon green">
            <CalendarDays size={23} />
          </div>

          <div>
            <span>Quá trình thực tập</span>
            <strong>{processes.length}</strong>
          </div>
        </div>

        <div className="nk-stat-card">
          <div className="nk-stat-icon orange">
            <Clock3 size={23} />
          </div>

          <div>
            <span>Đang hiển thị</span>
            <strong>{filteredJournals.length}</strong>
          </div>
        </div>
      </div>

      {/* NỘI DUNG */}

      <div className="nk-content">

        <div className="nk-section-header">
          <div>
            <h2>
              <ClipboardList size={21} />
              Danh sách nhật ký
            </h2>

            <p>
              Chọn quá trình thực tập đã được xác nhận để xem nhật ký.
            </p>
          </div>

          <button
            className="nk-btn-refresh"
            onClick={() => {
              loadProcesses();

              if (selectedProcess) {
                loadJournals(selectedProcess);
              }
            }}
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>

        {/* CHỌN QUÁ TRÌNH */}

        <div className="nk-toolbar">
          <div className="nk-select-wrapper">
            <label>Quá trình thực tập</label>

            <select
              value={selectedProcess}
              onChange={(e) =>
                setSelectedProcess(e.target.value)
              }
            >
              <option value="">
                Chọn quá trình thực tập
              </option>

              {processes.map((item) => (
                <option
                  key={item.maQuaTrinh}
                  value={item.maQuaTrinh}
                >
                  Quá trình #{item.maQuaTrinh} -{" "}
                  {item.tenViTri || "Thực tập"}
                </option>
              ))}
            </select>
          </div>

          <div className="nk-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Tìm kiếm nội dung nhật ký..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* THÔNG TIN QUÁ TRÌNH */}

        {currentProcess && (
          <div className="nk-process-card">
            <div className="nk-process-card-header">
              <div className="nk-process-heading">
                <div className="nk-process-icon">
                  <BriefcaseBusiness size={22} />
                </div>

                <div>
                  <span className="nk-process-label">
                    QUÁ TRÌNH THỰC TẬP
                  </span>

                  <h3>
                    Quá trình #{currentProcess.maQuaTrinh}
                  </h3>
                </div>
              </div>

              <span
                className={`nk-status ${
                  getStatusInfo(currentProcess.trangThai).className
                }`}
              >
                <span className="nk-status-dot"></span>
                {getStatusInfo(currentProcess.trangThai).label}
              </span>
            </div>

            <div className="nk-process-details">
              <div className="nk-process-detail">
                <span className="nk-detail-label">
                  <BriefcaseBusiness size={16} />
                  Vị trí thực tập
                </span>

                <strong>
                  {currentProcess.tenViTri || "Chưa cập nhật"}
                </strong>
              </div>

              <div className="nk-process-detail">
                <span className="nk-detail-label">
                  <CalendarDays size={16} />
                  Thời gian thực tập
                </span>

                <strong>
                  {formatDate(currentProcess.ngayBatDau)} -{" "}
                  {formatDate(currentProcess.ngayKetThuc)}
                </strong>
              </div>
            </div>

            <div className="nk-process-summary">
              <BookOpen size={17} />

              <span>
                Tổng cộng{" "}
                <strong>{journals.length} nhật ký</strong>{" "}
                đã được ghi nhận trong quá trình thực tập.
              </span>
            </div>
          </div>
        )}

        {/* DANH SÁCH NHẬT KÝ */}

        {loadingJournals ? (
          <div className="nk-empty">
            <RefreshCw className="nk-spin" size={28} />
            <p>Đang tải nhật ký...</p>
          </div>
        ) : processes.length === 0 ? (
          <div className="nk-empty">
            <ClipboardList size={45} />

            <h3>Chưa có quá trình thực tập</h3>

            <p>
              Nhật ký sẽ được mở khi doanh nghiệp và giảng viên
              chấp nhận đơn đăng ký thực tập của bạn.
            </p>
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="nk-empty">
            <BookOpen size={45} />

            <h3>
              {keyword
                ? "Không tìm thấy nhật ký phù hợp"
                : "Chưa có nhật ký thực tập"}
            </h3>

            <p>
              {keyword
                ? "Thử tìm kiếm bằng từ khóa khác nhé."
                : "Hãy thêm nhật ký để ghi lại những công việc đã thực hiện."}
            </p>
          </div>
        ) : (
          <div className="nk-timeline">
            {filteredJournals.map((item) => (
              <div
                className="nk-timeline-item"
                key={item.maNhatKy}
              >
                <div className="nk-timeline-marker">
                  <div className="nk-timeline-dot">
                    <CalendarDays size={17} />
                  </div>
                </div>

                <div className="nk-journal-card">
                  <div className="nk-journal-header">
                    <div className="nk-journal-date">
                      <span>NHẬT KÝ THỰC TẬP</span>

                      <h3>
                        Nhật ký ngày {formatDate(item.ngay)}
                      </h3>
                    </div>

                    <div className="nk-actions">
                      <button
                        className="nk-btn-edit"
                        onClick={() => openEditForm(item)}
                        title="Chỉnh sửa"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        className="nk-btn-delete"
                        onClick={() =>
                          deleteJournal(item.maNhatKy)
                        }
                        title="Xóa"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="nk-journal-content">
                    <p>{item.noiDung}</p>
                  </div>

                  <div className="nk-journal-footer">
                    <span>
                      <ClipboardList size={15} />
                      Mã nhật ký: #{item.maNhatKy}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORM THÊM / SỬA */}

      {showForm && (
        <div
          className="nk-modal-overlay"
          onClick={() => !saving && setShowForm(false)}
        >
          <div
            className="nk-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nk-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Cập nhật nhật ký"
                    : "Thêm nhật ký mới"}
                </h2>

                <p>
                  Quá trình thực tập #{selectedProcess}
                </p>
              </div>

              <button
                className="nk-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveJournal}>
              <div className="nk-form-group">
                <label>
                  Ngày thực hiện <span>*</span>
                </label>

                <input
                  type="date"
                  value={form.ngay}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ngay: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="nk-form-group">
                <label>
                  Nội dung công việc <span>*</span>
                </label>

                <textarea
                  rows="6"
                  placeholder="Mô tả công việc đã thực hiện trong ngày..."
                  value={form.noiDung}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      noiDung: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="nk-modal-footer">
                <button
                  type="button"
                  className="nk-btn-cancel"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="nk-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : isEditing
                    ? "Lưu thay đổi"
                    : "Thêm nhật ký"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
