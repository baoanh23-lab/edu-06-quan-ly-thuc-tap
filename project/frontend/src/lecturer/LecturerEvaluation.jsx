import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ClipboardCheck,
  Users,
  CheckCircle2,
  Clock3,
  CalendarDays,
  GraduationCap,
  Star,
  MessageSquareText,
  X,
  Send,
  Eye,
  AlertCircle,
  BookOpen,
  Paperclip,
  FileText,
  Download,
  File,
} from "lucide-react";

import api from "../services/api";
import "../styles/LecturerEvaluation.css";

// ==========================================
// HÀM HỖ TRỢ
// ==========================================

function formatDate(date) {
  if (!date) return "Chưa cập nhật";

  const value = String(date).substring(0, 10);
  const parts = value.split("-");

  if (parts.length !== 3) return value;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDateTime(date) {
  if (!date) return "Chưa cập nhật";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return String(date);

  return value.toLocaleString("vi-VN");
}

function downloadBlob(response, fileName) {
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "tep-tai-xuong";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

function getStatusLabel(daDanhGia) {
  return daDanhGia ? "Đã đánh giá" : "Chưa đánh giá";
}

function getReportStatus(status) {
  switch (String(status || "").toUpperCase()) {
    case "DA_DUYET":
      return {
        label: "Đã duyệt",
        className: "approved",
      };

    case "TU_CHOI":
      return {
        label: "Đã từ chối",
        className: "rejected",
      };

    default:
      return {
        label: "Chờ duyệt",
        className: "waiting",
      };
  }
}

// ==========================================
// COMPONENT
// ==========================================

function LecturerEvaluation() {
  // DANH SÁCH SINH VIÊN
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // CHI TIẾT QUÁ TRÌNH
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("evaluation");

  // NHẬT KÝ VÀ MINH CHỨNG
  const [journals, setJournals] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});

  const [journalLoading, setJournalLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(null);

  // BÁO CÁO
  const [reports, setReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // TẢI FILE VÀ XỬ LÝ BÁO CÁO
  const [downloading, setDownloading] = useState(null);

  // FORM ĐÁNH GIÁ
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // THÔNG BÁO
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (content, type = "success") => {
    setMessage(content);
    setMessageType(type);
  };

  // ==========================================
  // TẢI DANH SÁCH ĐÁNH GIÁ
  // ==========================================

  const loadEvaluations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/api/danh-gia/giang-vien");

      setEvaluations(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Lỗi tải danh sách đánh giá:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể tải danh sách sinh viên được phân công.",
        "error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  // ==========================================
  // TÌM KIẾM VÀ LỌC
  // ==========================================

  const filteredEvaluations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return evaluations.filter((item) => {
      const matchSearch =
        !keyword ||
        String(item.maSv || "").toLowerCase().includes(keyword) ||
        String(item.maQuaTrinh || "").includes(keyword) ||
        String(item.maDangKy || "").includes(keyword);

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "DONE" && item.daDanhGia) ||
        (statusFilter === "PENDING" && !item.daDanhGia);

      return matchSearch && matchStatus;
    });
  }, [evaluations, search, statusFilter]);

  // ==========================================
  // THỐNG KÊ
  // ==========================================

  const statistics = useMemo(() => {
    const total = evaluations.length;

    const completed = evaluations.filter(
      (item) => item.daDanhGia
    ).length;

    return {
      total,
      completed,
      pending: total - completed,
    };
  }, [evaluations]);

  // ==========================================
  // TẢI NHẬT KÝ
  // ==========================================

  const fetchJournals = async (maQuaTrinh) => {
    try {
      setJournalLoading(true);
      setJournals([]);
      setEvidenceMap({});

      const response = await api.get(
        `/api/nhat-ky/giang-vien/qua-trinh/${maQuaTrinh}`
      );

      setJournals(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Lỗi tải nhật ký:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể tải nhật ký thực tập.",
        "error"
      );
    } finally {
      setJournalLoading(false);
    }
  };

  // ==========================================
  // TẢI MINH CHỨNG
  // ==========================================

  const fetchEvidence = async (journal) => {
    if (!journal?.maNhatKy) return;

    const journalId = journal.maNhatKy;

    try {
      setEvidenceLoading(journalId);

      const response = await api.get(
        `/api/minh-chung/giang-vien/nhat-ky/${journalId}`
      );

      setEvidenceMap((previous) => ({
        ...previous,
        [journalId]: Array.isArray(response.data)
          ? response.data
          : [],
      }));
    } catch (error) {
      console.error("Lỗi tải minh chứng:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể tải danh sách minh chứng.",
        "error"
      );
    } finally {
      setEvidenceLoading(null);
    }
  };

  // ==========================================
  // TẢI DANH SÁCH BÁO CÁO
  // ==========================================

  const fetchReports = async (maQuaTrinh) => {
    try {
      setReportLoading(true);
      setReports([]);

      const response = await api.get(
        `/api/bao-cao/qua-trinh/${maQuaTrinh}`
      );

      setReports(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể tải danh sách báo cáo thực tập.",
        "error"
      );
    } finally {
      setReportLoading(false);
    }
  };

  // ==========================================
  // MỞ CHI TIẾT QUÁ TRÌNH
  // ==========================================

  const openDetail = async (item) => {
    setSelectedProcess(item);
    setActiveTab("evaluation");
    setShowForm(false);

    setScore("");
    setComment("");

    setJournals([]);
    setEvidenceMap({});
    setReports([]);

    setDetailLoading(true);

    try {
      const response = await api.get(
        `/api/danh-gia/qua-trinh/${item.maQuaTrinh}`
      );

      setSelectedProcess(response.data);

      if (response.data.daDanhGia) {
        setScore(String(response.data.diem ?? ""));
        setComment(response.data.noiDung || "");
      }

      await Promise.all([
        fetchJournals(item.maQuaTrinh),
        fetchReports(item.maQuaTrinh),
      ]);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể tải thông tin quá trình thực tập.",
        "error"
      );

      setSelectedProcess(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // ==========================================
  // ĐÓNG CHI TIẾT
  // ==========================================

  const closeDetail = () => {
    if (submitting || downloading !== null) return;

    setSelectedProcess(null);
    setShowForm(false);
    setActiveTab("evaluation");

    setJournals([]);
    setEvidenceMap({});
    setReports([]);

    setScore("");
    setComment("");
  };

  // ==========================================
  // TẢI MINH CHỨNG
  // ==========================================

  const handleDownloadEvidence = async (evidence) => {
    try {
      setDownloading(`evidence-${evidence.maMinhChung}`);

      const response = await api.get(
        `/api/minh-chung/giang-vien/${evidence.maMinhChung}/tai-xuong`,
        { responseType: "blob" }
      );

      downloadBlob(
        response,
        evidence.tenFile || "minh-chung"
      );

      showMessage("Tải minh chứng thành công!");
    } catch (error) {
      console.error("Lỗi tải minh chứng:", error);

      showMessage(
        "Không thể tải file minh chứng.",
        "error"
      );
    } finally {
      setDownloading(null);
    }
  };

  // ==========================================
  // TẢI BÁO CÁO
  // ==========================================

  const handleDownloadReport = async (report) => {
    try {
      setDownloading(`report-${report.maBaoCao}`);
  
      const response = await api.get(
        `/api/bao-cao/${report.maBaoCao}/tai-xuong`,
        { responseType: "blob" }
      );
  
      // Lấy tên file từ Content-Disposition của backend
      const disposition =
        response.headers["content-disposition"];
  
      let fileName = "";
  
      if (disposition) {
        const match = disposition.match(
          /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i
        );
  
        if (match) {
          fileName = decodeURIComponent(
            match[1] || match[2]
          );
        }
      }
  
      // Nếu không lấy được tên file từ backend
      if (!fileName) {
        const contentType =
          response.headers["content-type"] || "";
  
        let extension = ".docx";
  
        if (contentType.includes("application/pdf")) {
          extension = ".pdf";
        } else if (
          contentType.includes("application/msword")
        ) {
          extension = ".doc";
        } else if (
          contentType.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
        ) {
          extension = ".docx";
        }
  
        fileName = `bao-cao-${report.maBaoCao}${extension}`;
      }
  
      downloadBlob(response, fileName);
  
      showMessage("Tải báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);
  
      showMessage(
        "Không thể tải file báo cáo.",
        "error"
      );
    } finally {
      setDownloading(null);
    }
  };

  // ==========================================
  // DUYỆT BÁO CÁO
  // ==========================================

  const handleApproveReport = async (report) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn duyệt báo cáo "${report.tenBaoCao}" không?`
    );

    if (!confirmed) return;

    try {
      setDownloading(`approve-${report.maBaoCao}`);

      await api.put(
        `/api/bao-cao/${report.maBaoCao}/duyet`
      );

      showMessage("Duyệt báo cáo thực tập thành công!");

      await fetchReports(selectedProcess.maQuaTrinh);
    } catch (error) {
      console.error("Lỗi duyệt báo cáo:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể duyệt báo cáo. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setDownloading(null);
    }
  };

  // ==========================================
  // TỪ CHỐI BÁO CÁO
  // ==========================================

  const handleRejectReport = async (report) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn từ chối báo cáo "${report.tenBaoCao}" không?`
    );

    if (!confirmed) return;

    try {
      setDownloading(`reject-${report.maBaoCao}`);

      await api.put(
        `/api/bao-cao/${report.maBaoCao}/tu-choi`
      );

      showMessage("Đã từ chối báo cáo thực tập!");

      await fetchReports(selectedProcess.maQuaTrinh);
    } catch (error) {
      console.error("Lỗi từ chối báo cáo:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể từ chối báo cáo. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setDownloading(null);
    }
  };

  // ==========================================
  // MỞ FORM ĐÁNH GIÁ
  // ==========================================

  const openEvaluationForm = () => {
    if (!selectedProcess || selectedProcess.daDanhGia) return;

    setScore("");
    setComment("");
    setShowForm(true);
  };

  // ==========================================
  // GỬI ĐÁNH GIÁ SINH VIÊN
  // ==========================================

  const submitEvaluation = async (event) => {
    event.preventDefault();

    if (!selectedProcess) return;

    const numericScore = Number(score);

    if (score === "" || !Number.isFinite(numericScore)) {
      showMessage(
        "Vui lòng nhập điểm đánh giá.",
        "error"
      );
      return;
    }

    if (numericScore < 0 || numericScore > 10) {
      showMessage(
        "Điểm đánh giá phải từ 0 đến 10.",
        "error"
      );
      return;
    }

    if (!comment.trim()) {
      showMessage(
        "Vui lòng nhập nhận xét cho sinh viên.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      await api.post(
        `/api/danh-gia/qua-trinh/${selectedProcess.maQuaTrinh}`,
        {
          diem: numericScore,
          noiDung: comment.trim(),
        }
      );

      showMessage("Gửi đánh giá sinh viên thành công!");

      setShowForm(false);

      await loadEvaluations(true);

      const detailResponse = await api.get(
        `/api/danh-gia/qua-trinh/${selectedProcess.maQuaTrinh}`
      );

      setSelectedProcess(detailResponse.data);
      setScore(String(detailResponse.data.diem ?? ""));
      setComment(detailResponse.data.noiDung || "");
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);

      showMessage(
        error.response?.data?.message ||
          "Không thể gửi đánh giá. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // GIAO DIỆN
  // ==========================================

  return (
    <div className="lecturer-evaluation">

      {/* HEADER */}
      <div className="evaluation-header">
        <div>
          <div className="evaluation-breadcrumb">
            Giảng viên <span>/</span> Đánh giá sinh viên
          </div>

          <h1>Đánh giá sinh viên</h1>

          <p>
            Theo dõi nhật ký, minh chứng, báo cáo và ghi nhận
            kết quả đánh giá sinh viên được phân công.
          </p>
        </div>

        <button
          className="evaluation-refresh-btn"
          onClick={() => loadEvaluations(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "evaluation-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* THÔNG BÁO */}
      {message && (
        <div className={`evaluation-alert ${messageType}`}>
          {messageType === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Đóng thông báo"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* THỐNG KÊ */}
      <div className="evaluation-statistics">
        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon blue">
            <Users size={22} />
          </div>

          <div>
            <span>Tổng sinh viên</span>
            <strong>{statistics.total}</strong>
          </div>
        </div>

        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon green">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Đã đánh giá</span>
            <strong>{statistics.completed}</strong>
          </div>
        </div>

        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon orange">
            <Clock3 size={22} />
          </div>

          <div>
            <span>Chưa đánh giá</span>
            <strong>{statistics.pending}</strong>
          </div>
        </div>
      </div>

      {/* DANH SÁCH SINH VIÊN */}
      <div className="evaluation-content">
        <div className="evaluation-toolbar">
          <div className="evaluation-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Tìm theo mã sinh viên, mã quá trình..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chưa đánh giá</option>
            <option value="DONE">Đã đánh giá</option>
          </select>
        </div>

        <div className="evaluation-table-heading">
          <div>
            <h2>Danh sách sinh viên</h2>
            <p>Có {filteredEvaluations.length} kết quả phù hợp</p>
          </div>
        </div>

        {loading ? (
          <div className="evaluation-loading">
            <RefreshCw
              className="evaluation-spin"
              size={25}
            />
            <span>Đang tải danh sách sinh viên...</span>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="evaluation-empty">
            <div className="evaluation-empty-icon">
              <ClipboardCheck size={35} />
            </div>

            <h3>Không có dữ liệu đánh giá</h3>

            <p>
              {search || statusFilter !== "ALL"
                ? "Không tìm thấy sinh viên phù hợp với điều kiện tìm kiếm."
                : "Hiện chưa có sinh viên nào được phân công cho bạn."}
            </p>
          </div>
        ) : (
          <div className="evaluation-table-wrapper">
            <table className="evaluation-table">
              <thead>
                <tr>
                  <th>Thông tin sinh viên</th>
                  <th>Mã quá trình</th>
                  <th>Thời gian thực tập</th>
                  <th>Điểm đánh giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvaluations.map((item) => (
                  <tr key={item.maQuaTrinh}>
                    <td>
                      <div className="evaluation-student">
                        <div className="evaluation-student-avatar">
                          <GraduationCap size={20} />
                        </div>

                        <div>
                          <strong>
                            {item.hoTenSinhVien ||
                              item.tenSinhVien ||
                              item.maSv ||
                              "Chưa cập nhật"}
                          </strong>

                          <span>
                            Mã SV: {item.maSv || "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="evaluation-process-code">
                        QT-{item.maQuaTrinh}
                      </span>
                    </td>

                    <td>
                      <div className="evaluation-date-range">
                        <span>{formatDate(item.ngayBatDau)}</span>
                        <span>
                          đến {formatDate(item.ngayKetThuc)}
                        </span>
                      </div>
                    </td>

                    <td>
                      {item.daDanhGia ? (
                        <span className="evaluation-score">
                          <Star size={15} fill="currentColor" />
                          {Number(item.diem).toFixed(2)}
                        </span>
                      ) : (
                        <span className="evaluation-no-score">
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`evaluation-status ${
                          item.daDanhGia ? "done" : "pending"
                        }`}
                      >
                        {item.daDanhGia ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Clock3 size={14} />
                        )}

                        {getStatusLabel(item.daDanhGia)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="evaluation-detail-btn"
                        onClick={() => openDetail(item)}
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

      {/* MODAL CHI TIẾT */}
      {selectedProcess && (
        <div
          className="evaluation-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetail();
            }
          }}
        >
          <div className="evaluation-modal">

            {/* MODAL HEADER */}
            <div className="evaluation-modal-header">
              <div>
                <span>
                  QUÁ TRÌNH QT-{selectedProcess.maQuaTrinh}
                </span>

                <h2>Thông tin thực tập và đánh giá</h2>
              </div>

              <button
                type="button"
                className="evaluation-modal-close"
                onClick={closeDetail}
                disabled={submitting || downloading !== null}
              >
                <X size={21} />
              </button>
            </div>

            {detailLoading ? (
              <div className="evaluation-loading modal-loading">
                <RefreshCw
                  className="evaluation-spin"
                  size={25}
                />
                <span>Đang tải thông tin...</span>
              </div>
            ) : (
              <div className="evaluation-modal-body">

                {/* THÔNG TIN SINH VIÊN */}
                <div className="evaluation-student-info">
                  <div className="evaluation-student-avatar large">
                    <GraduationCap size={25} />
                  </div>

                  <div>
                    <span>Sinh viên</span>

                    <strong>
                      {selectedProcess.hoTenSinhVien ||
                        selectedProcess.tenSinhVien ||
                        selectedProcess.maSv ||
                        "Chưa cập nhật"}
                    </strong>

                    <small>
                      Mã sinh viên: {selectedProcess.maSv || "—"}
                      {" · "}
                      Mã đăng ký: {selectedProcess.maDangKy ?? "—"}
                    </small>
                  </div>
                </div>

                {/* THÔNG TIN QUÁ TRÌNH */}
                <div className="evaluation-process-info">
                  <div>
                    <CalendarDays size={18} />

                    <div>
                      <span>Ngày bắt đầu</span>
                      <strong>
                        {formatDate(selectedProcess.ngayBatDau)}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <CalendarDays size={18} />

                    <div>
                      <span>Ngày kết thúc</span>
                      <strong>
                        {formatDate(selectedProcess.ngayKetThuc)}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <ClipboardCheck size={18} />

                    <div>
                      <span>Trạng thái quá trình</span>
                      <strong>
                        {selectedProcess.trangThaiQuaTrinh ||
                          selectedProcess.trangThai ||
                          "Chưa cập nhật"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* CÁC TAB */}
                <div className="evaluation-tabs">
                  <button
                    className={
                      activeTab === "evaluation" ? "active" : ""
                    }
                    onClick={() => setActiveTab("evaluation")}
                  >
                    <Star size={16} />
                    Đánh giá
                  </button>

                  <button
                    className={
                      activeTab === "journals" ? "active" : ""
                    }
                    onClick={() => setActiveTab("journals")}
                  >
                    <BookOpen size={16} />
                    Nhật ký
                    <span>{journals.length}</span>
                  </button>

                  <button
                    className={
                      activeTab === "reports" ? "active" : ""
                    }
                    onClick={() => setActiveTab("reports")}
                  >
                    <FileText size={16} />
                    Báo cáo
                    <span>{reports.length}</span>
                  </button>
                </div>

                {/* ================================= */}
                {/* TAB ĐÁNH GIÁ */}
                {/* ================================= */}

                {activeTab === "evaluation" && (
                  <div className="evaluation-tab-content">
                    {selectedProcess.daDanhGia ? (
                      <div className="evaluation-result">
                        <div className="evaluation-result-heading">
                          <CheckCircle2 size={19} />
                          Đã hoàn thành đánh giá
                        </div>

                        <div className="evaluation-result-score">
                          <Star
                            size={23}
                            fill="currentColor"
                          />

                          <strong>
                            {Number(selectedProcess.diem).toFixed(2)}
                          </strong>

                          <span>/ 10 điểm</span>
                        </div>

                        <div className="evaluation-result-comment">
                          <span>
                            <MessageSquareText size={16} />
                            Nhận xét của giảng viên
                          </span>

                          <p>
                            {selectedProcess.noiDung ||
                              "Không có nhận xét."}
                          </p>
                        </div>

                        <div className="evaluation-result-date">
                          Ngày đánh giá:{" "}
                          {formatDateTime(
                            selectedProcess.ngayDanhGia
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {!showForm ? (
                          <div className="evaluation-notice">
                            <Clock3 size={19} />

                            <div>
                              <strong>Chưa có đánh giá</strong>

                              <p>
                                Quá trình thực tập này chưa được
                                giảng viên gửi đánh giá.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <form
                            className="evaluation-form"
                            onSubmit={submitEvaluation}
                          >
                            <div className="evaluation-form-group">
                              <label htmlFor="evaluationScore">
                                Điểm đánh giá <span>*</span>
                              </label>

                              <div className="evaluation-score-input">
                                <input
                                  id="evaluationScore"
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.01"
                                  placeholder="Nhập điểm từ 0 đến 10"
                                  value={score}
                                  onChange={(event) =>
                                    setScore(event.target.value)
                                  }
                                  required
                                />

                                <span>/ 10</span>
                              </div>

                              <small>
                                Điểm đánh giá nằm trong khoảng
                                từ 0 đến 10.
                              </small>
                            </div>

                            <div className="evaluation-form-group">
                              <label htmlFor="evaluationComment">
                                Nhận xét sinh viên <span>*</span>
                              </label>

                              <textarea
                                id="evaluationComment"
                                rows="5"
                                placeholder="Nhập nhận xét về kết quả, thái độ và quá trình thực tập..."
                                value={comment}
                                onChange={(event) =>
                                  setComment(event.target.value)
                                }
                                required
                              />
                            </div>

                            <div className="evaluation-form-warning">
                              <AlertCircle size={17} />

                              Sau khi gửi, đánh giá sẽ được lưu cố định
                              và không thể chỉnh sửa hoặc xóa.
                            </div>

                            <div className="evaluation-form-actions">
                              <button
                                type="button"
                                className="evaluation-cancel-btn"
                                onClick={() => setShowForm(false)}
                                disabled={submitting}
                              >
                                Hủy
                              </button>

                              <button
                                type="submit"
                                className="evaluation-submit-btn"
                                disabled={submitting}
                              >
                                {submitting ? (
                                  <>
                                    <RefreshCw
                                      size={17}
                                      className="evaluation-spin"
                                    />
                                    Đang gửi...
                                  </>
                                ) : (
                                  <>
                                    <Send size={17} />
                                    Gửi đánh giá
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        )}

                        {!showForm && (
                          <div className="evaluation-modal-footer">
                            <button
                              type="button"
                              className="evaluation-submit-btn"
                              onClick={openEvaluationForm}
                            >
                              <Star size={17} />
                              Tiến hành đánh giá
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ================================= */}
                {/* TAB NHẬT KÝ VÀ MINH CHỨNG */}
                {/* ================================= */}

                {activeTab === "journals" && (
                  <div className="evaluation-tab-content">
                    {journalLoading ? (
                      <div className="evaluation-loading">
                        <RefreshCw
                          size={23}
                          className="evaluation-spin"
                        />
                        Đang tải nhật ký...
                      </div>
                    ) : journals.length === 0 ? (
                      <div className="evaluation-empty small">
                        <BookOpen size={30} />

                        <h3>Chưa có nhật ký</h3>

                        <p>
                          Sinh viên chưa ghi nhật ký thực tập.
                        </p>
                      </div>
                    ) : (
                      <div className="evaluation-journal-list">
                        {journals.map((journal) => {
                          const evidence =
                            evidenceMap[journal.maNhatKy] || [];

                          return (
                            <div
                              className="evaluation-journal-card"
                              key={journal.maNhatKy}
                            >
                              <div className="evaluation-journal-date">
                                <CalendarDays size={17} />
                                {formatDate(journal.ngay)}
                              </div>

                              <p>{journal.noiDung}</p>

                              <div className="evaluation-evidence-heading">
                                <span>
                                  <Paperclip size={15} />
                                  Minh chứng đính kèm
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    fetchEvidence(journal)
                                  }
                                  disabled={
                                    evidenceLoading ===
                                    journal.maNhatKy
                                  }
                                >
                                  {evidenceLoading === journal.maNhatKy
                                    ? "Đang tải..."
                                    : evidenceMap[journal.maNhatKy]
                                      ? "Tải lại"
                                      : "Xem minh chứng"}
                                </button>
                              </div>

                              {evidenceMap[journal.maNhatKy] && (
                                evidence.length === 0 ? (
                                  <div className="evaluation-no-evidence">
                                    Nhật ký này chưa có minh chứng.
                                  </div>
                                ) : (
                                  <div className="evaluation-file-list">
                                    {evidence.map((file) => (
                                      <div
                                        className="evaluation-file-item"
                                        key={file.maMinhChung}
                                      >
                                        <div className="evaluation-file-icon">
                                          <File size={19} />
                                        </div>

                                        <div className="evaluation-file-info">
                                          <strong>
                                            {file.tenFile}
                                          </strong>

                                          <span>
                                            {formatDateTime(
                                              file.ngayNop
                                            )}
                                          </span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDownloadEvidence(file)
                                          }
                                          disabled={
                                            downloading ===
                                            `evidence-${file.maMinhChung}`
                                          }
                                          title="Tải minh chứng"
                                        >
                                          {downloading ===
                                          `evidence-${file.maMinhChung}` ? (
                                            <RefreshCw
                                              size={17}
                                              className="evaluation-spin"
                                            />
                                          ) : (
                                            <Download size={17} />
                                          )}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ================================= */}
                {/* TAB BÁO CÁO */}
                {/* ================================= */}

                {activeTab === "reports" && (
                  <div className="evaluation-tab-content">
                    {reportLoading ? (
                      <div className="evaluation-loading">
                        <RefreshCw
                          size={23}
                          className="evaluation-spin"
                        />
                        Đang tải báo cáo...
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="evaluation-empty small">
                        <FileText size={30} />

                        <h3>Chưa có báo cáo</h3>

                        <p>
                          Sinh viên chưa nộp báo cáo thực tập
                          cho quá trình này.
                        </p>
                      </div>
                    ) : (
                      <div className="evaluation-report-list">
                        {reports.map((report) => {
                          const status = getReportStatus(
                            report.trangThai
                          );

                          const isPending =
                            String(report.trangThai || "").toUpperCase() ===
                            "CHO_DUYET";

                          const isApproving =
                            downloading ===
                            `approve-${report.maBaoCao}`;

                          const isRejecting =
                            downloading ===
                            `reject-${report.maBaoCao}`;

                          const isDownloading =
                            downloading ===
                            `report-${report.maBaoCao}`;

                          const isProcessing =
                            downloading !== null;

                          return (
                            <div
                              className="evaluation-report-card"
                              key={report.maBaoCao}
                            >
                              <div className="evaluation-report-icon">
                                <FileText size={23} />
                              </div>

                              <div className="evaluation-report-info">
                                <strong>
                                  {report.tenBaoCao ||
                                    `Báo cáo ${report.maBaoCao}`}
                                </strong>

                                <span>
                                  Mã báo cáo: {report.maBaoCao}
                                </span>

                                <span>
                                  Ngày nộp:{" "}
                                  {formatDateTime(report.ngayNop)}
                                </span>

                                <span
                                  className={`evaluation-report-status ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              <div className="evaluation-report-actions">
                                <button
                                  type="button"
                                  className="evaluation-download-btn"
                                  onClick={() =>
                                    handleDownloadReport(report)
                                  }
                                  disabled={isProcessing}
                                  title="Tải báo cáo"
                                >
                                  {isDownloading ? (
                                    <RefreshCw
                                      size={16}
                                      className="evaluation-spin"
                                    />
                                  ) : (
                                    <Download size={16} />
                                  )}

                                  Tải báo cáo
                                </button>

                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      className="evaluation-approve-btn"
                                      onClick={() =>
                                        handleApproveReport(report)
                                      }
                                      disabled={isProcessing}
                                    >
                                      {isApproving ? (
                                        <RefreshCw
                                          size={16}
                                          className="evaluation-spin"
                                        />
                                      ) : (
                                        <CheckCircle2 size={16} />
                                      )}

                                      Duyệt
                                    </button>

                                    <button
                                      type="button"
                                      className="evaluation-reject-btn"
                                      onClick={() =>
                                        handleRejectReport(report)
                                      }
                                      disabled={isProcessing}
                                    >
                                      {isRejecting ? (
                                        <RefreshCw
                                          size={16}
                                          className="evaluation-spin"
                                        />
                                      ) : (
                                        <X size={16} />
                                      )}

                                      Từ chối
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LecturerEvaluation;
