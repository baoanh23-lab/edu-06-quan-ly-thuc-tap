
import { useEffect, useState } from "react";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  CalendarDays,
  ClipboardList,
  BriefcaseBusiness,
  Paperclip,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

import api from "../services/api";
import "../styles/InternshipEvidence.css";

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

function getFileIcon(fileName) {
  const extension = fileName?.split(".").pop()?.toLowerCase();

  if (["png", "jpg", "jpeg"].includes(extension)) {
    return <FileImage size={25} />;
  }

  if (["xls", "xlsx"].includes(extension)) {
    return <FileSpreadsheet size={25} />;
  }

  if (["doc", "docx", "pdf"].includes(extension)) {
    return <FileText size={25} />;
  }

  return <File size={25} />;
}

function InternshipEvidence() {
  const [processes, setProcesses] = useState([]);
  const [journals, setJournals] = useState([]);
  const [evidences, setEvidences] = useState([]);

  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("");

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

          return exists ? current : String(data[0].maQuaTrinh);
        });
      } else {
        setSelectedProcess("");
        setJournals([]);
        setSelectedJournal("");
        setEvidences([]);
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

  // Lấy danh sách nhật ký theo quá trình
  const fetchJournals = async (maQuaTrinh) => {
    if (!maQuaTrinh) {
      setJournals([]);
      setSelectedJournal("");
      setEvidences([]);
      return;
    }

    try {
      setError("");

      const response = await api.get(
        `/api/nhat-ky/qua-trinh/${maQuaTrinh}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setJournals(data);

      if (data.length > 0) {
        setSelectedJournal((current) => {
          const exists = data.some(
            (item) =>
              String(item.maNhatKy) === String(current)
          );

          return exists ? current : String(data[0].maNhatKy);
        });
      } else {
        setSelectedJournal("");
        setEvidences([]);
      }
    } catch (err) {
      setJournals([]);
      setSelectedJournal("");
      setEvidences([]);

      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách nhật ký."
      );
    }
  };

  // Lấy danh sách minh chứng theo nhật ký
  const fetchEvidences = async (maNhatKy) => {
    if (!maNhatKy) {
      setEvidences([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/minh-chung/nhat-ky/${maNhatKy}`
      );

      setEvidences(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setEvidences([]);

      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách minh chứng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    if (selectedProcess) {
      fetchJournals(selectedProcess);
    }
  }, [selectedProcess]);

  useEffect(() => {
    if (selectedJournal) {
      fetchEvidences(selectedJournal);
    } else {
      setEvidences([]);
    }
  }, [selectedJournal]);

  // Chọn file
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedExtensions = [
      "pdf",
      "png",
      "jpg",
      "jpeg",
      "doc",
      "docx",
      "xls",
      "xlsx",
    ];

    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError(
        "Chỉ chấp nhận file PDF, PNG, JPG, Word và Excel."
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

  // Tải minh chứng lên
  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedJournal) {
      setError("Vui lòng chọn nhật ký thực tập.");
      return;
    }

    if (!selectedFile) {
      setError("Vui lòng chọn file minh chứng.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      

      const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await api.post(
        `/api/minh-chung/nhat-ky/${selectedJournal}`,
        formData
        );

      setSuccess(
        response.data?.message ||
        "Tải minh chứng thành công!"
      );

      setSelectedFile(null);

      const input = document.getElementById(
        "evidence-file-input"
      );

      if (input) input.value = "";

      await fetchEvidences(selectedJournal);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Tải minh chứng thất bại. Vui lòng thử lại."
      );
    } finally {
      setUploading(false);
    }
  };

  // Tải file xuống
  const handleDownload = async (evidence) => {
    try {
      setError("");

      const response = await api.get(
        `/api/minh-chung/${evidence.maMinhChung}/tai-xuong`,
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
    } catch (err) {
      setError("Không thể tải file minh chứng.");
    }
  };

  // Xóa minh chứng
  const handleDelete = async (evidence) => {
    const confirmed = window.confirm(
      `Bà có chắc muốn xóa minh chứng "${evidence.tenFile}" không?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(evidence.maMinhChung);
      setError("");
      setSuccess("");

      const response = await api.delete(
        `/api/minh-chung/${evidence.maMinhChung}`
      );

      setSuccess(
        response.data?.message ||
        "Xóa minh chứng thành công!"
      );

      await fetchEvidences(selectedJournal);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể xóa minh chứng."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const currentProcess = processes.find(
    (item) =>
      String(item.maQuaTrinh) === String(selectedProcess)
  );

  const currentJournal = journals.find(
    (item) =>
      String(item.maNhatKy) === String(selectedJournal)
  );

  return (
    <div className="evidence-page">
      <div className="evidence-header">
        <div>
          <span className="evidence-subtitle">
            QUẢN LÝ THỰC TẬP
          </span>

          <h1>Minh chứng thực tập</h1>

          <p>
            Tải lên và quản lý hình ảnh, tài liệu minh chứng
            cho từng nhật ký thực tập của bạn.
          </p>
        </div>

        <div className="evidence-header-icon">
          <Paperclip size={34} />
        </div>
      </div>

      {error && (
        <div className="evidence-alert error">
          <AlertCircle size={19} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="evidence-alert success">
          <CheckCircle size={19} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      <div className="evidence-statistics">
        <div className="evidence-stat-card">
          <div className="evidence-stat-icon blue">
            <BriefcaseBusiness size={23} />
          </div>
          <div>
            <span>Quá trình thực tập</span>
            <strong>{processes.length}</strong>
          </div>
        </div>

        <div className="evidence-stat-card">
          <div className="evidence-stat-icon purple">
            <ClipboardList size={23} />
          </div>
          <div>
            <span>Nhật ký thực tập</span>
            <strong>{journals.length}</strong>
          </div>
        </div>

        <div className="evidence-stat-card">
          <div className="evidence-stat-icon green">
            <Paperclip size={23} />
          </div>
          <div>
            <span>Minh chứng của nhật ký</span>
            <strong>{evidences.length}</strong>
          </div>
        </div>
      </div>

      <div className="evidence-content-grid">
        <section className="evidence-card evidence-upload-card">
          <div className="evidence-section-heading">
            <div className="evidence-heading-icon">
              <Upload size={21} />
            </div>

            <div>
              <h2>Tải minh chứng lên</h2>
              <p>Đính kèm tài liệu cho nhật ký thực tập</p>
            </div>
          </div>

          <form onSubmit={handleUpload}>
            <div className="evidence-form-group">
              <label>Quá trình thực tập</label>

              <select
                value={selectedProcess}
                onChange={(e) => {
                  setSelectedProcess(e.target.value);
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

            <div className="evidence-form-group">
              <label>Nhật ký thực tập</label>

              <select
                value={selectedJournal}
                onChange={(e) => {
                  setSelectedJournal(e.target.value);
                  setSelectedFile(null);
                  setSuccess("");
                }}
                disabled={journals.length === 0}
              >
                {journals.length === 0 ? (
                  <option value="">
                    Chưa có nhật ký thực tập
                  </option>
                ) : (
                  journals.map((item) => (
                    <option
                      key={item.maNhatKy}
                      value={item.maNhatKy}
                    >
                      {formatDate(item.ngay)}
                      {" - "}
                      {item.noiDung?.slice(0, 65)}
                      {item.noiDung?.length > 65 ? "..." : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            {currentJournal && (
              <div className="evidence-journal-preview">
                <div className="preview-heading">
                  <CalendarDays size={17} />
                  <strong>
                    Nhật ký ngày {formatDate(currentJournal.ngay)}
                  </strong>
                </div>

                <p>{currentJournal.noiDung}</p>
              </div>
            )}

            <div className="evidence-form-group">
              <label>Chọn file minh chứng</label>

              <label
                htmlFor="evidence-file-input"
                className="evidence-file-dropzone"
              >
                <div className="evidence-drop-icon">
                  <Upload size={28} />
                </div>

                <strong>
                  {selectedFile
                    ? selectedFile.name
                    : "Nhấn để chọn file"}
                </strong>

                <span>
                  PDF, PNG, JPG, DOC, DOCX, XLS, XLSX
                </span>

                <span>Dung lượng tối đa 10 MB</span>

                <input
                  id="evidence-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="evidence-selected-file">
                <div className="selected-file-icon">
                  {getFileIcon(selectedFile.name)}
                </div>

                <div className="selected-file-info">
                  <strong>{selectedFile.name}</strong>
                  <span>{formatSize(selectedFile.size)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);

                    const input = document.getElementById(
                      "evidence-file-input"
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
              className="evidence-upload-button"
              disabled={
                uploading ||
                !selectedFile ||
                !selectedJournal
              }
            >
              {uploading ? (
                <>
                  <RefreshCw size={18} className="evidence-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Tải minh chứng lên
                </>
              )}
            </button>
          </form>
        </section>

        <section className="evidence-card evidence-list-card">
          <div className="evidence-list-heading">
            <div>
              <h2>Danh sách minh chứng</h2>
              <p>
                Các file được đính kèm vào nhật ký đã chọn
              </p>
            </div>

            <button
              className="evidence-refresh-button"
              onClick={() => fetchEvidences(selectedJournal)}
              disabled={!selectedJournal || loading}
              title="Làm mới"
            >
              <RefreshCw
                size={18}
                className={loading ? "evidence-spin" : ""}
              />
            </button>
          </div>

          {currentProcess && (
            <div className="evidence-current-process">
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
            <div className="evidence-empty">
              <RefreshCw
                size={30}
                className="evidence-spin"
              />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : !selectedJournal ? (
            <div className="evidence-empty">
              <ClipboardList size={42} />
              <h3>Chưa có nhật ký thực tập</h3>
              <p>
                Hãy tạo nhật ký thực tập trước khi tải minh chứng.
              </p>
            </div>
          ) : evidences.length === 0 ? (
            <div className="evidence-empty">
              <Paperclip size={42} />
              <h3>Chưa có minh chứng</h3>
              <p>
                Nhật ký này chưa có file minh chứng nào.
              </p>
            </div>
          ) : (
            <div className="evidence-list">
              {evidences.map((item) => (
                <div
                  className="evidence-item"
                  key={item.maMinhChung}
                >
                  <div className="evidence-file-icon">
                    {getFileIcon(item.tenFile)}
                  </div>

                  <div className="evidence-file-details">
                    <strong title={item.tenFile}>
                      {item.tenFile}
                    </strong>

                    <span>
                      Mã minh chứng: {item.maMinhChung}
                    </span>

                    <small>
                      <CalendarDays size={13} />
                      {formatDateTime(item.ngayNop)}
                    </small>
                  </div>

                  <div className="evidence-item-actions">
                    <button
                      className="evidence-download-button"
                      onClick={() => handleDownload(item)}
                      title="Tải xuống"
                    >
                      <Download size={17} />
                    </button>

                    <button
                      className="evidence-delete-button"
                      onClick={() => handleDelete(item)}
                      disabled={
                        deletingId === item.maMinhChung
                      }
                      title="Xóa minh chứng"
                    >
                      {deletingId === item.maMinhChung ? (
                        <RefreshCw
                          size={17}
                          className="evidence-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="evidence-note">
        <AlertCircle size={19} />

        <p>
          <strong>Lưu ý:</strong> Minh chứng được gắn với từng
          nhật ký thực tập. Hãy chọn đúng ngày nhật ký trước
          khi tải file lên. Giảng viên và doanh nghiệp sẽ sử
          dụng các minh chứng này để theo dõi, đánh giá quá
          trình thực tập của bạn.
        </p>
      </div>
    </div>
  );
}

export default InternshipEvidence;
