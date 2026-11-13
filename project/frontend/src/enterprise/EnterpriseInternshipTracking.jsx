
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  Paperclip,
  Download,
  X,
  MapPin,
  Mail,
  Phone,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";

import "../styles/EnterpriseInternshipTracking.css";

const API_URL = "http://localhost:8080/api";

function formatDate(date) {
  if (!date) return "Chưa cập nhật";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString("vi-VN");
}

function getStatusLabel(status) {
  const statuses = {
    CHUA_BAT_DAU: "Chưa bắt đầu",
    DANG_THUC_TAP: "Đang thực tập",
    HOAN_THANH: "Đã hoàn thành",
    TAM_DUNG: "Tạm dừng",
    CHAP_NHAN: "Đã chấp nhận",
  };

  return statuses[status] || status || "Chưa cập nhật";
}

function getStatusClass(status) {
  if (status === "HOAN_THANH") return "completed";
  if (status === "DANG_THUC_TAP") return "working";
  if (status === "TAM_DUNG") return "paused";

  return "waiting";
}

// Trạng thái báo cáo
function getReportStatusLabel(status) {
  const statuses = {
    CHO_DUYET: "Chờ giảng viên duyệt",
    DA_DUYET: "Đã duyệt",
    DA_CHAP_NHAN: "Đã duyệt",
    DUYET: "Đã duyệt",
    TU_CHOI: "Đã từ chối",
  };

  return statuses[status] || status || "Chưa cập nhật";
}

function getReportStatusClass(status) {
  if (["DA_DUYET", "DA_CHAP_NHAN", "DUYET"].includes(status)) {
    return "approved";
  }

  if (status === "TU_CHOI") {
    return "rejected";
  }

  return "pending";
}

function EnterpriseInternshipTracking() {
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);

  const [selectedProcess, setSelectedProcess] = useState(null);

  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [evidences, setEvidences] = useState([]);

  // Báo cáo thực tập
  const [reports, setReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(null);

  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("token");

  const requestApi = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
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
          data?.error ||
          (typeof data === "string" && data) ||
          `Không thể thực hiện yêu cầu (${response.status})`
      );
    }

    return data;
  };

  // =====================================================
  // LẤY DANH SÁCH SINH VIÊN ĐANG THỰC TẬP
  // =====================================================

  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await requestApi("/doanh-nghiep/thuc-tap");

      const list = Array.isArray(data) ? data : [];

      setProcesses(list);
      setFilteredProcesses(list);

      if (selectedProcess) {
        const updated = list.find(
          (item) => item.maQuaTrinh === selectedProcess.maQuaTrinh
        );

        if (updated) {
          setSelectedProcess((previous) => ({
            ...previous,
            ...updated,
          }));
        }
      }
    } catch (err) {
      setError(err.message);

      if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProcess]);

  useEffect(() => {
    loadProcesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // TÌM KIẾM SINH VIÊN
  // =====================================================

  useEffect(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) {
      setFilteredProcesses(processes);
      return;
    }

    const result = processes.filter((item) =>
      [
        item.tenSinhVien,
        item.maSv,
        item.tenViTri,
        item.trangThai,
      ]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(value))
    );

    setFilteredProcesses(result);
  }, [keyword, processes]);

  // =====================================================
  // TẢI BÁO CÁO CỦA QUÁ TRÌNH THỰC TẬP
  // =====================================================

  const loadReports = async (maQuaTrinh) => {
    try {
      setReportLoading(true);

      const data = await requestApi(
        `/bao-cao/qua-trinh/${maQuaTrinh}`
      );

      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setReports([]);
      throw err;
    } finally {
      setReportLoading(false);
    }
  };

  // =====================================================
  // XEM CHI TIẾT QUÁ TRÌNH THỰC TẬP
  // =====================================================

  const handleSelectProcess = async (process) => {
    try {
      setSelectedProcess(process);
      setSelectedJournal(null);

      setJournals([]);
      setEvidences([]);
      setReports([]);

      setDetailLoading(true);
      setError("");
      setMessage("");

      const [detail, journalData, reportData] = await Promise.all([
        requestApi(`/doanh-nghiep/thuc-tap/${process.maQuaTrinh}`),

        requestApi(
          `/doanh-nghiep/thuc-tap/${process.maQuaTrinh}/nhat-ky`
        ),

        requestApi(
          `/bao-cao/qua-trinh/${process.maQuaTrinh}`
        ),
      ]);

      setSelectedProcess(detail);
      setJournals(Array.isArray(journalData) ? journalData : []);
      setReports(Array.isArray(reportData) ? reportData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // XEM MINH CHỨNG CỦA NHẬT KÝ
  // =====================================================

  const handleSelectJournal = async (journal) => {
    try {
      setSelectedJournal(journal);
      setEvidences([]);
      setEvidenceLoading(true);
      setError("");
      setMessage("");

      const data = await requestApi(
        `/minh-chung/doanh-nghiep/nhat-ky/${journal.maNhatKy}`
      );

      setEvidences(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvidenceLoading(false);
    }
  };

  // =====================================================
  // TẢI FILE MINH CHỨNG
  // =====================================================

  const handleDownload = async (evidence) => {
    try {
      setDownloading(evidence.maMinhChung);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/minh-chung/doanh-nghiep/${evidence.maMinhChung}/tai-xuong`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message || "Không thể tải file minh chứng!"
        );
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = evidence.tenFile || "minh-chung";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileUrl);

      setMessage("Tải minh chứng thành công!");
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  // =====================================================
  // TẢI BÁO CÁO THỰC TẬP
  // =====================================================

  const handleDownloadReport = async (report) => {
    try {
      setDownloadingReport(report.maBaoCao);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/bao-cao/${report.maBaoCao}/tai-xuong`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();

        let data = null;

        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        throw new Error(
          data?.message || "Không thể tải báo cáo thực tập!"
        );
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileUrl;

      // Ưu tiên tên file do backend trả về
      const disposition = response.headers.get("Content-Disposition");

      let fileName = report.tenBaoCao || `bao-cao-${report.maBaoCao}`;

      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        const normalMatch = disposition.match(/filename="?([^"]+)"?/i);

        if (utf8Match) {
          fileName = decodeURIComponent(utf8Match[1]);
        } else if (normalMatch) {
          fileName = normalMatch[1];
        }
      }

      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileUrl);

      setMessage("Tải báo cáo thực tập thành công!");
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingReport(null);
    }
  };

  // =====================================================
  // ĐÓNG CHI TIẾT
  // =====================================================

  const closeDetail = () => {
    setSelectedProcess(null);
    setSelectedJournal(null);

    setJournals([]);
    setEvidences([]);
    setReports([]);

    setError("");
    setMessage("");
  };

  const totalStudents = processes.length;

  const workingStudents = processes.filter(
    (item) => item.trangThai === "DANG_THUC_TAP"
  ).length;

  const completedStudents = processes.filter(
    (item) => item.trangThai === "HOAN_THANH"
  ).length;

  return (
    <div className="enterprise-tracking">
      <div className="tracking-header">
        <div>
          <h2>Theo dõi thực tập</h2>
          <p>
            Theo dõi quá trình thực tập, nhật ký, minh chứng
            và báo cáo của sinh viên tại doanh nghiệp.
          </p>
        </div>

        <button
          className="tracking-refresh-btn"
          onClick={loadProcesses}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "tracking-spin" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* THÔNG BÁO */}

      {error && (
        <div className="tracking-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {message && (
        <div className="tracking-alert success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* THỐNG KÊ */}

      <div className="tracking-statistics">
        <div className="tracking-stat-card">
          <div className="tracking-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <span>Tổng sinh viên</span>
            <strong>{totalStudents}</strong>
          </div>
        </div>

        <div className="tracking-stat-card">
          <div className="tracking-stat-icon orange">
            <Clock3 size={22} />
          </div>
          <div>
            <span>Đang thực tập</span>
            <strong>{workingStudents}</strong>
          </div>
        </div>

        <div className="tracking-stat-card">
          <div className="tracking-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span>Đã hoàn thành</span>
            <strong>{completedStudents}</strong>
          </div>
        </div>
      </div>

      {/* DANH SÁCH SINH VIÊN */}

      <div className="tracking-content">
        <div className="tracking-list-panel">
          <div className="tracking-panel-header">
            <div>
              <h3>Danh sách sinh viên</h3>
              <p>{filteredProcesses.length} sinh viên</p>
            </div>

            <div className="tracking-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Tìm sinh viên, vị trí..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="tracking-empty">
              <RefreshCw className="tracking-spin" size={25} />
              <p>Đang tải danh sách...</p>
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div className="tracking-empty">
              <FolderOpen size={40} />
              <h4>Chưa có sinh viên thực tập</h4>
              <p>
                Danh sách sẽ hiển thị khi sinh viên được chấp nhận
                và có quá trình thực tập.
              </p>
            </div>
          ) : (
            <div className="tracking-student-list">
              {filteredProcesses.map((item) => (
                <div
                  className={`tracking-student-card ${
                    selectedProcess?.maQuaTrinh === item.maQuaTrinh
                      ? "active"
                      : ""
                  }`}
                  key={item.maQuaTrinh}
                >
                  <div className="tracking-student-avatar">
                    {(item.tenSinhVien || "SV")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="tracking-student-info">
                    <h4>{item.tenSinhVien || "Chưa cập nhật tên"}</h4>
                    <span>Mã sinh viên: {item.maSv || "—"}</span>

                    <p>
                      <BriefcaseBusiness size={14} />
                      {item.tenViTri || "Chưa cập nhật vị trí"}
                    </p>

                    <span
                      className={`tracking-status ${getStatusClass(
                        item.trangThai
                      )}`}
                    >
                      {getStatusLabel(item.trangThai)}
                    </span>
                  </div>

                  <button
                    className="tracking-view-btn"
                    onClick={() => handleSelectProcess(item)}
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                    Chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHI TIẾT QUÁ TRÌNH */}

        <div className="tracking-detail-panel">
          {!selectedProcess ? (
            <div className="tracking-detail-empty">
              <ClipboardList size={48} />
              <h3>Chi tiết quá trình thực tập</h3>
              <p>
                Chọn một sinh viên trong danh sách để xem
                thông tin thực tập, báo cáo, nhật ký và minh chứng.
              </p>
            </div>
          ) : detailLoading ? (
            <div className="tracking-empty">
              <RefreshCw className="tracking-spin" size={25} />
              <p>Đang tải thông tin...</p>
            </div>
          ) : (
            <>
              <div className="tracking-detail-header">
                <div>
                  <h3>Thông tin thực tập</h3>
                  <p>
                    Mã quá trình: #{selectedProcess.maQuaTrinh}
                  </p>
                </div>

                <button
                  className="tracking-close-btn"
                  onClick={closeDetail}
                  title="Đóng chi tiết"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="tracking-student-profile">
                <div className="tracking-profile-avatar">
                  {(selectedProcess.tenSinhVien || "SV")
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{selectedProcess.tenSinhVien}</h3>
                  <span>Mã sinh viên: {selectedProcess.maSv}</span>
                </div>
              </div>

              <div className="tracking-information-grid">
                <div className="tracking-information-item">
                  <BriefcaseBusiness size={17} />
                  <div>
                    <span>Vị trí thực tập</span>
                    <strong>
                      {selectedProcess.tenViTri || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>

                <div className="tracking-information-item">
                  <CalendarDays size={17} />
                  <div>
                    <span>Ngày bắt đầu</span>
                    <strong>
                      {formatDate(selectedProcess.ngayBatDau)}
                    </strong>
                  </div>
                </div>

                <div className="tracking-information-item">
                  <CalendarDays size={17} />
                  <div>
                    <span>Ngày kết thúc</span>
                    <strong>
                      {formatDate(selectedProcess.ngayKetThuc)}
                    </strong>
                  </div>
                </div>

                <div className="tracking-information-item">
                  <MapPin size={17} />
                  <div>
                    <span>Trạng thái</span>
                    <strong>
                      {getStatusLabel(selectedProcess.trangThai)}
                    </strong>
                  </div>
                </div>

                {selectedProcess.email && (
                  <div className="tracking-information-item">
                    <Mail size={17} />
                    <div>
                      <span>Email sinh viên</span>
                      <strong>{selectedProcess.email}</strong>
                    </div>
                  </div>
                )}

                {selectedProcess.soDienThoai && (
                  <div className="tracking-information-item">
                    <Phone size={17} />
                    <div>
                      <span>Số điện thoại</span>
                      <strong>{selectedProcess.soDienThoai}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="tracking-progress-box">
                <div className="tracking-progress-heading">
                  <span>Tiến độ thực tập</span>
                  <strong>
                    {selectedProcess.tienDo || "Chưa cập nhật"}
                  </strong>
                </div>

                <div className="tracking-progress-track">
                  <div
                    className="tracking-progress-fill"
                    style={{
                      width: /^\d+%$/.test(
                        String(selectedProcess.tienDo || "")
                      )
                        ? selectedProcess.tienDo
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* BÁO CÁO THỰC TẬP */}

              <div className="tracking-report-section">
                <div className="tracking-section-heading">
                  <div>
                    <h3>Báo cáo thực tập</h3>
                    <p>
                      {reports.length} báo cáo được sinh viên nộp
                    </p>
                  </div>
                  <FileText size={21} />
                </div>

                {reportLoading ? (
                  <div className="tracking-empty small">
                    <RefreshCw
                      className="tracking-spin"
                      size={22}
                    />
                    <p>Đang tải danh sách báo cáo...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="tracking-empty small">
                    <FolderOpen size={30} />
                    <p>Sinh viên chưa nộp báo cáo thực tập.</p>
                  </div>
                ) : (
                  <div className="tracking-report-list">
                    {reports.map((report) => (
                      <div
                        className="tracking-report-item"
                        key={report.maBaoCao}
                      >
                        <div className="tracking-report-icon">
                          <FileText size={22} />
                        </div>

                        <div className="tracking-report-info">
                          <strong>
                            {report.tenBaoCao ||
                              `Báo cáo #${report.maBaoCao}`}
                          </strong>

                          <span>
                            Ngày nộp: {formatDate(report.ngayNop)}
                          </span>

                          <span
                            className={`tracking-report-status ${getReportStatusClass(
                              report.trangThai
                            )}`}
                          >
                            {getReportStatusLabel(report.trangThai)}
                          </span>
                        </div>

                        <button
                          className="tracking-report-download"
                          onClick={() => handleDownloadReport(report)}
                          disabled={
                            downloadingReport === report.maBaoCao
                          }
                          title="Tải báo cáo"
                        >
                          {downloadingReport === report.maBaoCao ? (
                            <RefreshCw
                              size={17}
                              className="tracking-spin"
                            />
                          ) : (
                            <Download size={17} />
                          )}
                          <span>
                            {downloadingReport === report.maBaoCao
                              ? "Đang tải"
                              : "Tải báo cáo"}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NHẬT KÝ */}

              <div className="tracking-journal-section">
                <div className="tracking-section-heading">
                  <div>
                    <h3>Nhật ký thực tập</h3>
                    <p>
                      {journals.length} nhật ký được ghi nhận
                    </p>
                  </div>
                  <FileText size={21} />
                </div>

                {journals.length === 0 ? (
                  <div className="tracking-empty small">
                    <FileText size={30} />
                    <p>Sinh viên chưa có nhật ký thực tập.</p>
                  </div>
                ) : (
                  <div className="tracking-journal-list">
                    {journals.map((journal) => (
                      <div
                        key={journal.maNhatKy}
                        className={`tracking-journal-card ${
                          selectedJournal?.maNhatKy === journal.maNhatKy
                            ? "active"
                            : ""
                        }`}
                      >
                        <div className="tracking-journal-date">
                          <CalendarDays size={16} />
                          {formatDate(journal.ngay)}
                        </div>

                        <p>
                          {journal.noiDung || "Không có nội dung"}
                        </p>

                        <button
                          onClick={() => handleSelectJournal(journal)}
                        >
                          <Paperclip size={15} />
                          Xem minh chứng
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MINH CHỨNG */}

              {selectedJournal && (
                <div className="tracking-evidence-section">
                  <div className="tracking-section-heading">
                    <div>
                      <h3>Minh chứng nhật ký</h3>
                      <p>
                        Nhật ký ngày {formatDate(selectedJournal.ngay)}
                      </p>
                    </div>
                    <Paperclip size={21} />
                  </div>

                  {evidenceLoading ? (
                    <div className="tracking-empty small">
                      <RefreshCw
                        className="tracking-spin"
                        size={22}
                      />
                      <p>Đang tải minh chứng...</p>
                    </div>
                  ) : evidences.length === 0 ? (
                    <div className="tracking-empty small">
                      <FolderOpen size={30} />
                      <p>Nhật ký này chưa có file minh chứng.</p>
                    </div>
                  ) : (
                    <div className="tracking-evidence-list">
                      {evidences.map((evidence) => (
                        <div
                          className="tracking-evidence-item"
                          key={evidence.maMinhChung}
                        >
                          <div className="tracking-evidence-icon">
                            <FileText size={21} />
                          </div>

                          <div className="tracking-evidence-info">
                            <strong>{evidence.tenFile}</strong>
                            <span>
                              Ngày nộp: {formatDate(evidence.ngayNop)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDownload(evidence)}
                            disabled={
                              downloading === evidence.maMinhChung
                            }
                            title="Tải minh chứng"
                          >
                            {downloading === evidence.maMinhChung ? (
                              <RefreshCw
                                size={17}
                                className="tracking-spin"
                              />
                            ) : (
                              <Download size={17} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnterpriseInternshipTracking;
