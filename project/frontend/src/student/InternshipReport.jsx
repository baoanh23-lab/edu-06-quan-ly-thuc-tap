
import { useEffect, useState } from "react";
import {
  FileText,
  File,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  CalendarDays,
  ClipboardList,
  BriefcaseBusiness,
  FileCheck,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

import api from "../services/api";
import "../styles/InternshipReport.css";

function formatDate(date) {
  if (!date) return "Chưa cập nhật";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString("vi-VN");
}

function formatDateTime(date) {
  if (!date) return "Chưa cập nhật";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleString("vi-VN");
}

function formatSize(size) {
  if (!size) return "0 KB";

  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(2)} MB`
    : `${(size / 1024).toFixed(1)} KB`;
}

function getStatusInfo(status) {
  switch (status) {
    case "DA_DUYET":
      return {
        label: "Đã duyệt",
        className: "approved",
      };

    case "TU_CHOI":
      return {
        label: "Từ chối",
        className: "rejected",
      };

    default:
      return {
        label: "Chờ duyệt",
        className: "pending",
      };
  }
}

function InternshipReport() {
  const [processes, setProcesses] = useState([]);
  const [reports, setReports] = useState([]);

  const [selectedProcess, setSelectedProcess] = useState("");
  const [reportName, setReportName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy danh sách quá trình thực tập
  const fetchProcesses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/qua-trinh-thuc-tap/cua-toi"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setProcesses(data);

      if (data.length > 0) {
        setSelectedProcess((current) => {
          const exists = data.some(
            (item) =>
              String(item.maQuaTrinh) === String(current)
          );

          return exists
            ? current
            : String(data[0].maQuaTrinh);
        });
      } else {
        setSelectedProcess("");
        setReports([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách quá trình thực tập."
      );
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách báo cáo theo quá trình thực tập
  const fetchReports = async (maQuaTrinh) => {
    if (!maQuaTrinh) {
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/bao-cao/qua-trinh/${maQuaTrinh}`
      );

      setReports(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      setReports([]);

      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách báo cáo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    fetchReports(selectedProcess);
  }, [selectedProcess]);

  // Chọn file báo cáo
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedExtensions = ["pdf", "doc", "docx"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError(
        "Chỉ chấp nhận file PDF, Word DOC hoặc DOCX."
      );

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Dung lượng file không được vượt quá 10 MB.");

      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Nộp báo cáo thực tập hoặc nộp lại sau khi bị từ chối
  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedProcess) {
      setError("Vui lòng chọn quá trình thực tập.");
      return;
    }

    if (!reportName.trim()) {
      setError("Vui lòng nhập tên báo cáo.");
      return;
    }

    if (!selectedFile) {
      setError("Vui lòng chọn file báo cáo.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("tenBaoCao", reportName.trim());
      formData.append("file", selectedFile);

      const response = await api.post(
        `/api/bao-cao/qua-trinh/${selectedProcess}`,
        formData
      );

      setSuccess(
        response.data?.message ||
        "Nộp báo cáo thực tập thành công! Báo cáo đang chờ giảng viên duyệt."
      );

      setReportName("");
      setSelectedFile(null);

      const input = document.getElementById(
        "report-file-input"
      );

      if (input) input.value = "";

      await fetchReports(selectedProcess);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Nộp báo cáo thất bại. Vui lòng thử lại."
      );
    } finally {
      setUploading(false);
    }
  };

  // Tải file báo cáo xuống
  const handleDownload = async (report) => {
    try {
      setError("");

      const response = await api.get(
        `/api/bao-cao/${report.maBaoCao}/tai-xuong`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      link.download = report.tenBaoCao || "bao-cao-thuc-tap";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Không thể tải file báo cáo.");
    }
  };

  // Xóa báo cáo đang chờ duyệt hoặc bị từ chối
  const handleDelete = async (report) => {
    const confirmed = window.confirm(
      report.trangThai === "TU_CHOI"
        ? `Báo cáo "${report.tenBaoCao}" đã bị từ chối. Bà có muốn xóa báo cáo này để nộp lại không?`
        : `Bà có chắc muốn xóa báo cáo "${report.tenBaoCao}" không?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(report.maBaoCao);
      setError("");
      setSuccess("");

      const response = await api.delete(
        `/api/bao-cao/${report.maBaoCao}`
      );

      setSuccess(
        response.data?.message ||
        "Xóa báo cáo thành công! Bà có thể nộp báo cáo mới."
      );

      await fetchReports(selectedProcess);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể xóa báo cáo."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Làm mới dữ liệu
  const handleRefresh = async () => {
    await fetchProcesses();

    if (selectedProcess) {
      await fetchReports(selectedProcess);
    }
  };

  const currentProcess = processes.find(
    (item) =>
      String(item.maQuaTrinh) === String(selectedProcess)
  );

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (item) => item.trangThai === "CHO_DUYET"
  ).length;

  const approvedReports = reports.filter(
    (item) => item.trangThai === "DA_DUYET"
  ).length;

  const rejectedReports = reports.filter(
    (item) => item.trangThai === "TU_CHOI"
  ).length;

  return (
    <div className="report-page">
      <div className="report-header">
        <div>
          <span className="report-subtitle">
            QUẢN LÝ THỰC TẬP
          </span>

          <h1>Báo cáo thực tập</h1>

          <p>
            Nộp và quản lý báo cáo tổng kết quá trình thực tập
            của bạn.
          </p>
        </div>

        <div className="report-header-icon">
          <FileText size={34} />
        </div>
      </div>

      {error && (
        <div className="report-alert error">
          <AlertCircle size={19} />
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="report-alert success">
          <CheckCircle size={19} />
          <span>{success}</span>

          <button onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      <div className="report-statistics">
        <div className="report-stat-card">
          <div className="report-stat-icon blue">
            <BriefcaseBusiness size={23} />
          </div>

          <div>
            <span>Quá trình thực tập</span>
            <strong>{processes.length}</strong>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon purple">
            <FileText size={23} />
          </div>

          <div>
            <span>Tổng số báo cáo</span>
            <strong>{totalReports}</strong>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon orange">
            <ClipboardList size={23} />
          </div>

          <div>
            <span>Chờ duyệt</span>
            <strong>{pendingReports}</strong>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon green">
            <FileCheck size={23} />
          </div>

          <div>
            <span>Đã duyệt</span>
            <strong>{approvedReports}</strong>
          </div>
        </div>
      </div>

      <div className="report-content-grid">
        <section className="report-card report-upload-card">
          <div className="report-section-heading">
            <div className="report-heading-icon">
              <Upload size={21} />
            </div>

            <div>
              <h2>Nộp báo cáo thực tập</h2>
              <p>
                Tải lên tài liệu tổng kết quá trình thực tập
              </p>
            </div>
          </div>

          {rejectedReports > 0 && (
            <div className="report-rejected-note">
              <AlertCircle size={16} />
              Có {rejectedReports} báo cáo bị từ chối.
              Bà có thể xóa báo cáo bị từ chối và nộp lại
              file đã chỉnh sửa.
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="report-form-group">
              <label>Quá trình thực tập</label>

              <select
                value={selectedProcess}
                onChange={(e) => {
                  setSelectedProcess(e.target.value);
                  setReportName("");
                  setSelectedFile(null);
                  setSuccess("");
                }}
                disabled={processes.length === 0}
              >
                {processes.length === 0 ? (
                  <option value="">
                    Chưa có quá trình thực tập
                  </option>
                ) : (
                  processes.map((item) => (
                    <option
                      key={item.maQuaTrinh}
                      value={item.maQuaTrinh}
                    >
                      {item.tenViTri || "Quá trình thực tập"}
                      {" - Mã QT: "}
                      {item.maQuaTrinh}
                    </option>
                  ))
                )}
              </select>
            </div>

            {currentProcess && (
              <div className="report-process-preview">
                <div className="report-preview-heading">
                  <CalendarDays size={17} />
                  <strong>
                    Thông tin quá trình thực tập
                  </strong>
                </div>

                <div className="report-process-dates">
                  <div>
                    <span>Ngày bắt đầu</span>
                    <strong>
                      {formatDate(currentProcess.ngayBatDau)}
                    </strong>
                  </div>

                  <div>
                    <span>Ngày kết thúc</span>
                    <strong>
                      {formatDate(currentProcess.ngayKetThuc)}
                    </strong>
                  </div>
                </div>

                <div className="report-process-status">
                  <span>Trạng thái:</span>
                  <strong>
                    {currentProcess.trangThai || "Chưa cập nhật"}
                  </strong>
                </div>
              </div>
            )}

            <div className="report-form-group">
              <label>Tên báo cáo</label>

              <input
                type="text"
                placeholder="Nhập tên báo cáo thực tập..."
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                maxLength={255}
              />
            </div>

            <div className="report-form-group">
              <label>Chọn file báo cáo</label>

              <label
                htmlFor="report-file-input"
                className="report-file-dropzone"
              >
                <div className="report-drop-icon">
                  <Upload size={28} />
                </div>

                <strong>
                  {selectedFile
                    ? selectedFile.name
                    : "Nhấn để chọn file"}
                </strong>

                <span>PDF, DOC, DOCX</span>
                <span>Dung lượng tối đa 10 MB</span>

                <input
                  id="report-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="report-selected-file">
                <div className="report-selected-icon">
                  <FileText size={25} />
                </div>

                <div className="report-selected-info">
                  <strong>{selectedFile.name}</strong>
                  <span>{formatSize(selectedFile.size)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);

                    const input = document.getElementById(
                      "report-file-input"
                    );

                    if (input) input.value = "";
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <button
              type="submit"
              className="report-upload-button"
              disabled={
                uploading ||
                !selectedProcess ||
                !reportName.trim() ||
                !selectedFile
              }
            >
              {uploading ? (
                <>
                  <RefreshCw
                    size={18}
                    className="report-spin"
                  />
                  Đang nộp báo cáo...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Nộp báo cáo
                </>
              )}
            </button>
          </form>
        </section>

        <section className="report-card report-list-card">
          <div className="report-list-heading">
            <div>
              <h2>Danh sách báo cáo</h2>
              <p>
                Các báo cáo đã nộp của quá trình thực tập
              </p>
            </div>

            <button
              className="report-refresh-button"
              onClick={handleRefresh}
              disabled={loading}
              title="Làm mới"
            >
              <RefreshCw
                size={18}
                className={loading ? "report-spin" : ""}
              />
            </button>
          </div>

          {currentProcess && (
            <div className="report-current-process">
              <span>Đang xem quá trình</span>

              <strong>
                {currentProcess.tenViTri || "Thực tập"}
              </strong>

              <small>
                {formatDate(currentProcess.ngayBatDau)}
                {" - "}
                {formatDate(currentProcess.ngayKetThuc)}
              </small>
            </div>
          )}

          {loading ? (
            <div className="report-empty">
              <RefreshCw
                size={30}
                className="report-spin"
              />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : !selectedProcess ? (
            <div className="report-empty">
              <BriefcaseBusiness size={42} />
              <h3>Chưa có quá trình thực tập</h3>
              <p>
                Bạn cần có quá trình thực tập để quản lý báo cáo.
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="report-empty">
              <FileText size={42} />
              <h3>Chưa có báo cáo thực tập</h3>
              <p>
                Quá trình thực tập này chưa có báo cáo nào được nộp.
              </p>
            </div>
          ) : (
            <div className="report-list">
              {reports.map((item) => {
                const status = getStatusInfo(item.trangThai);

                return (
                  <div
                    className="report-item"
                    key={item.maBaoCao}
                  >
                    <div className="report-file-icon">
                      <FileText size={25} />
                    </div>

                    <div className="report-file-details">
                      <strong title={item.tenBaoCao}>
                        {item.tenBaoCao}
                      </strong>

                      <span>
                        Mã báo cáo: {item.maBaoCao}
                      </span>

                      <small>
                        <CalendarDays size={13} />
                        {formatDateTime(item.ngayNop)}
                      </small>

                      <span
                        className={`report-status ${status.className}`}
                      >
                        {status.label}
                      </span>

                      {item.trangThai === "TU_CHOI" && (
                        <small className="report-rejected-text">
                          Báo cáo bị từ chối. Bà có thể xóa
                          báo cáo này để nộp lại.
                        </small>
                      )}
                    </div>

                    <div className="report-item-actions">
                      <button
                        className="report-download-button"
                        onClick={() => handleDownload(item)}
                        title="Tải xuống"
                      >
                        <Download size={17} />
                      </button>

                      {["CHO_DUYET", "TU_CHOI"].includes(
                        item.trangThai
                      ) && (
                        <button
                          className="report-delete-button"
                          onClick={() => handleDelete(item)}
                          disabled={
                            deletingId === item.maBaoCao
                          }
                          title={
                            item.trangThai === "TU_CHOI"
                              ? "Xóa báo cáo bị từ chối để nộp lại"
                              : "Xóa báo cáo"
                          }
                        >
                          {deletingId === item.maBaoCao ? (
                            <RefreshCw
                              size={17}
                              className="report-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="report-note">
        <AlertCircle size={19} />

        <p>
          <strong>Lưu ý:</strong> Báo cáo thực tập là tài liệu
          tổng kết quá trình thực tập của sinh viên. Hãy kiểm tra
          nội dung và file trước khi nộp. Báo cáo sẽ được lưu lại
          để phục vụ việc xem xét và đánh giá của giảng viên.
          Nếu báo cáo bị từ chối, sinh viên có thể xóa báo cáo
          cũ và nộp lại báo cáo đã chỉnh sửa.
        </p>
      </div>
    </div>
  );
}

export default InternshipReport;
