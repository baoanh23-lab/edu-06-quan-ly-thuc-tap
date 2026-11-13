import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  BookOpen,
  CalendarDays,
  Building2,
  GraduationCap,
  FileText,
  Paperclip,
  Download,
  Eye,
  X,
  Clock3,
  ClipboardList,
  AlertCircle,
  File,
} from "lucide-react";

import api from "../services/api";
import "../styles/LecturerJournalEvidence.css";

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

  if (Number.isNaN(value.getTime())) {
    return String(date);
  }

  return value.toLocaleString("vi-VN");
}

function getFileIcon(fileName = "") {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["png", "jpg", "jpeg"].includes(extension)) {
    return "image";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  return "file";
}

function LecturerJournalEvidence() {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [journals, setJournals] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [journalLoading, setJournalLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedJournal, setSelectedJournal] = useState(null);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Lấy danh sách sinh viên được phân công thông qua quá trình thực tập
  const fetchProcesses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/qua-trinh-thuc-tap/giang-vien"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setProcesses(data);

      // Giữ lại sinh viên đang chọn nếu dữ liệu vẫn còn
      setSelectedProcess((current) => {
        if (!current) return null;

        return (
          data.find(
            (item) =>
              String(item.maQuaTrinh) ===
              String(current.maQuaTrinh)
          ) || null
        );
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách sinh viên được phân công."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  // Tìm kiếm sinh viên
  const filteredProcesses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return processes;

    return processes.filter((item) => {
      const values = [
        item.maSv,
        item.maSV,
        item.hoTenSinhVien,
        item.tenSinhVien,
        item.hoTen,
        item.tenViTri,
        item.tenDoanhNghiep,
        item.tenDn,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      );
    });
  }, [processes, search]);

  // Lấy nhật ký của sinh viên được chọn
  const fetchJournals = async (process) => {
    if (!process?.maQuaTrinh) return;

    try {
      setJournalLoading(true);
      setError("");
      setJournals([]);
      setEvidenceMap({});

      const response = await api.get(
        `/api/nhat-ky/giang-vien/qua-trinh/${process.maQuaTrinh}`
      );

      setJournals(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải nhật ký thực tập."
      );
    } finally {
      setJournalLoading(false);
    }
  };

  const handleSelectProcess = (process) => {
    setSelectedProcess(process);
    setSelectedJournal(null);
    setShowJournalModal(false);
    fetchJournals(process);
  };

  // Lấy minh chứng của một nhật ký
  const fetchEvidence = async (journal) => {
    if (!journal?.maNhatKy) return;

    const journalId = journal.maNhatKy;

    try {
      setEvidenceLoading(journalId);

      const response = await api.get(
        `/api/minh-chung/giang-vien/nhat-ky/${journalId}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setEvidenceMap((previous) => ({
        ...previous,
        [journalId]: data,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách minh chứng."
      );
    } finally {
      setEvidenceLoading(null);
    }
  };

  // Mở chi tiết nhật ký
  const handleOpenJournal = async (journal) => {
    setSelectedJournal(journal);
    setShowJournalModal(true);

    if (!Object.prototype.hasOwnProperty.call(
      evidenceMap,
      journal.maNhatKy
    )) {
      await fetchEvidence(journal);
    }
  };

  // Tải file minh chứng
  const handleDownload = async (evidence) => {
    try {
      setDownloading(evidence.maMinhChung);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/api/minh-chung/giang-vien/${evidence.maMinhChung}/tai-xuong`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = evidence.tenFile || "minh-chung";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setSuccess("Tải minh chứng thành công!");
    } catch (err) {
      setError("Không thể tải file minh chứng.");
    } finally {
      setDownloading(null);
    }
  };

  const closeModal = () => {
    setShowJournalModal(false);
    setSelectedJournal(null);
  };

  const totalJournals = journals.length;

  const totalEvidence = useMemo(() => {
    return Object.values(evidenceMap).reduce(
      (total, items) => total + items.length,
      0
    );
  }, [evidenceMap]);

  return (
    <div className="lecturer-journal-page">
      {/* HEADER */}
      <div className="lj-header">
        <div>
          <div className="lj-breadcrumb">
            Giảng viên / Nhật ký và minh chứng
          </div>

          <h1>Nhật ký và minh chứng</h1>

          <p>
            Theo dõi nhật ký thực tập và xem minh chứng
            do sinh viên được phân công gửi lên.
          </p>
        </div>

        <button
          className="lj-refresh-btn"
          onClick={fetchProcesses}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "lj-spinning" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* ALERT */}
      {error && (
        <div className="lj-alert lj-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="lj-alert lj-alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="lj-stat-grid">
        <div className="lj-stat-card">
          <div className="lj-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <span>Sinh viên được phân công</span>
            <strong>{processes.length}</strong>
          </div>
        </div>

        <div className="lj-stat-card">
          <div className="lj-stat-icon purple">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Nhật ký đang xem</span>
            <strong>{selectedProcess ? totalJournals : 0}</strong>
          </div>
        </div>

        <div className="lj-stat-card">
          <div className="lj-stat-icon orange">
            <Paperclip size={22} />
          </div>
          <div>
            <span>Minh chứng đã tải</span>
            <strong>{selectedProcess ? totalEvidence : 0}</strong>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="lj-main-grid">
        {/* STUDENT LIST */}
        <section className="lj-panel lj-student-panel">
          <div className="lj-panel-heading">
            <div>
              <h2>Sinh viên thực tập</h2>
              <p>Chọn sinh viên để xem nhật ký</p>
            </div>

            <span className="lj-count">
              {filteredProcesses.length}
            </span>
          </div>

          <div className="lj-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm mã SV, tên sinh viên, doanh nghiệp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="lj-student-list">
            {loading ? (
              <div className="lj-empty">
                <RefreshCw className="lj-spinning" size={25} />
                <p>Đang tải danh sách sinh viên...</p>
              </div>
            ) : filteredProcesses.length === 0 ? (
              <div className="lj-empty">
                <Users size={32} />
                <p>Chưa có sinh viên được phân công.</p>
              </div>
            ) : (
              filteredProcesses.map((item) => (
                <button
                  key={item.maQuaTrinh}
                  className={`lj-student-item ${
                    String(selectedProcess?.maQuaTrinh) ===
                    String(item.maQuaTrinh)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectProcess(item)}
                >
                  <div className="lj-avatar">
                    <GraduationCap size={21} />
                  </div>

                  <div className="lj-student-info">
                    <strong>
                      {item.hoTenSinhVien ||
                        item.tenSinhVien ||
                        item.hoTen ||
                        "Sinh viên"}
                    </strong>

                    <span>
                      {item.maSv || item.maSV || "Chưa có mã SV"}
                    </span>

                    <small>
                      {item.tenViTri || "Chưa cập nhật vị trí"}
                    </small>
                  </div>

                  <Eye size={17} className="lj-view-icon" />
                </button>
              ))
            )}
          </div>
        </section>

        {/* JOURNAL CONTENT */}
        <section className="lj-panel lj-journal-panel">
          {!selectedProcess ? (
            <div className="lj-select-placeholder">
              <div className="lj-placeholder-icon">
                <ClipboardList size={38} />
              </div>

              <h2>Chưa chọn sinh viên</h2>

              <p>
                Hãy chọn một sinh viên ở danh sách bên trái
                để xem nhật ký và minh chứng thực tập.
              </p>
            </div>
          ) : (
            <>
              <div className="lj-panel-heading lj-journal-heading">
                <div>
                  <h2>Nhật ký thực tập</h2>
                  <p>
                    {selectedProcess.hoTenSinhVien ||
                      selectedProcess.tenSinhVien ||
                      selectedProcess.hoTen ||
                      "Sinh viên"}
                    {" · "}
                    {selectedProcess.maSv ||
                      selectedProcess.maSV ||
                      ""}
                  </p>
                </div>

                <span className="lj-count">
                  {journals.length} nhật ký
                </span>
              </div>

              <div className="lj-student-summary">
                <div>
                  <Building2 size={17} />
                  <span>
                    {selectedProcess.tenDoanhNghiep ||
                      selectedProcess.tenDn ||
                      "Chưa cập nhật doanh nghiệp"}
                  </span>
                </div>

                <div>
                  <BriefcaseIcon />
                  <span>
                    {selectedProcess.tenViTri ||
                      "Chưa cập nhật vị trí"}
                  </span>
                </div>

                <div>
                  <CalendarDays size={17} />
                  <span>
                    {formatDate(selectedProcess.ngayBatDau)}
                    {" - "}
                    {formatDate(selectedProcess.ngayKetThuc)}
                  </span>
                </div>
              </div>

              <div className="lj-journal-list">
                {journalLoading ? (
                  <div className="lj-empty">
                    <RefreshCw
                      size={25}
                      className="lj-spinning"
                    />
                    <p>Đang tải nhật ký...</p>
                  </div>
                ) : journals.length === 0 ? (
                  <div className="lj-empty">
                    <FileText size={34} />
                    <p>Sinh viên chưa có nhật ký thực tập.</p>
                  </div>
                ) : (
                  journals.map((journal) => (
                    <div
                      className="lj-journal-card"
                      key={journal.maNhatKy}
                    >
                      <div className="lj-journal-date">
                        <CalendarDays size={18} />
                        <span>{formatDate(journal.ngay)}</span>
                      </div>

                      <p className="lj-journal-content">
                        {journal.noiDung}
                      </p>

                      <div className="lj-journal-footer">
                        <button
                          className="lj-detail-btn"
                          onClick={() => handleOpenJournal(journal)}
                        >
                          <Eye size={16} />
                          Xem nhật ký và minh chứng
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* JOURNAL DETAIL MODAL */}
      {showJournalModal && selectedJournal && (
        <div
          className="lj-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="lj-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lj-modal-header">
              <div>
                <span>CHI TIẾT NHẬT KÝ</span>
                <h2>
                  Nhật ký ngày {formatDate(selectedJournal.ngay)}
                </h2>
              </div>

              <button
                className="lj-close-btn"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </div>

            <div className="lj-modal-body">
              <div className="lj-detail-section">
                <h3>
                  <FileText size={18} />
                  Nội dung thực tập
                </h3>

                <div className="lj-content-box">
                  {selectedJournal.noiDung}
                </div>
              </div>

              <div className="lj-detail-section">
                <div className="lj-evidence-heading">
                  <h3>
                    <Paperclip size={18} />
                    Minh chứng đính kèm
                  </h3>

                  <span>
                    {(evidenceMap[selectedJournal.maNhatKy] || [])
                      .length}{" "}
                    file
                  </span>
                </div>

                {evidenceLoading === selectedJournal.maNhatKy ? (
                  <div className="lj-empty">
                    <RefreshCw
                      size={22}
                      className="lj-spinning"
                    />
                    <p>Đang tải minh chứng...</p>
                  </div>
                ) : (
                  <div className="lj-evidence-list">
                    {(evidenceMap[selectedJournal.maNhatKy] || [])
                      .length === 0 ? (
                      <div className="lj-no-evidence">
                        <Paperclip size={27} />
                        <p>Nhật ký này chưa có minh chứng.</p>
                      </div>
                    ) : (
                      evidenceMap[selectedJournal.maNhatKy].map(
                        (evidence) => (
                          <div
                            className="lj-evidence-item"
                            key={evidence.maMinhChung}
                          >
                            <div className="lj-file-icon">
                              {getFileIcon(evidence.tenFile) ===
                              "image" ? (
                                <Eye size={21} />
                              ) : (
                                <File size={21} />
                              )}
                            </div>

                            <div className="lj-file-info">
                              <strong>{evidence.tenFile}</strong>
                              <span>
                                <Clock3 size={13} />
                                {formatDateTime(evidence.ngayNop)}
                              </span>
                            </div>

                            <button
                              className="lj-download-btn"
                              onClick={() =>
                                handleDownload(evidence)
                              }
                              disabled={
                                downloading === evidence.maMinhChung
                              }
                            >
                              {downloading ===
                              evidence.maMinhChung ? (
                                <RefreshCw
                                  size={17}
                                  className="lj-spinning"
                                />
                              ) : (
                                <Download size={17} />
                              )}
                              <span>Tải xuống</span>
                            </button>
                          </div>
                        )
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lj-modal-footer">
              <button
                className="lj-close-modal-btn"
                onClick={closeModal}
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

function BriefcaseIcon() {
  return <ClipboardList size={17} />;
}

export default LecturerJournalEvidence;