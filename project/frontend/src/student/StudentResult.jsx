
import { useEffect, useState } from "react";
import {
  Award,
  Eye,
  CalendarDays,
  ClipboardCheck,
  Building2,
  GraduationCap,
  FileText,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

import api from "../services/api";
import "../styles/StudentResult.css";

function formatDate(value) {
  if (!value) return "Chưa có";

  return new Date(value).toLocaleDateString("vi-VN");
}

function formatScore(value) {
  if (value === null || value === undefined) return "Chưa có";
  return value;
}

function getStatusLabel(status) {
  if (status === "DA_XAC_NHAN") return "Đã xác nhận";
  if (status === "CHUA_XAC_NHAN") return "Chưa xác nhận";
  return status || "Chưa có thông tin";
}

function getResultLabel(result) {
  if (result === "DAT") return "Đạt";
  if (result === "KHONG_DAT") return "Không đạt";
  return "Chưa có kết quả";
}

function StudentResult() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/ket-qua/sinh-vien");
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Lỗi tải kết quả thực tập:", err);

      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền xem kết quả thực tập.");
      } else {
        setError("Không thể tải danh sách kết quả thực tập.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (maQuaTrinh) => {
    try {
      setDetailLoading(true);
      setError("");

      const response = await api.get(
        `/api/ket-qua/sinh-vien/qua-trinh/${maQuaTrinh}`
      );

      setSelectedResult(response.data);
    } catch (err) {
      console.error("Lỗi tải chi tiết kết quả:", err);
      setError("Không thể tải chi tiết kết quả thực tập.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const renderResultStatus = (result) => {
    return (
      <span
        className={`sr-status ${
          result === "DA_XAC_NHAN" ? "confirmed" : "pending"
        }`}
      >
        {getStatusLabel(result)}
      </span>
    );
  };

  if (selectedResult) {
    const detail = selectedResult;

    return (
      <div className="sr-container">
        <button
          className="sr-back-button"
          onClick={() => setSelectedResult(null)}
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </button>

        <div className="sr-page-heading">
          <div className="sr-heading-icon">
            <Award size={27} />
          </div>

          <div>
            <h2>Chi tiết kết quả thực tập</h2>
            <p>
              Thông tin đánh giá và kết quả của quá trình thực tập.
            </p>
          </div>
        </div>

        <section className="sr-result-summary">
          <div>
            <span>Kết quả cuối cùng</span>
            <h2
              className={
                detail.ketQuaCuoiCung === "DAT"
                  ? "sr-result-pass"
                  : detail.ketQuaCuoiCung === "KHONG_DAT"
                  ? "sr-result-fail"
                  : ""
              }
            >
              {getResultLabel(detail.ketQuaCuoiCung)}
            </h2>
          </div>

          <div>
            <span>Trạng thái xác nhận</span>
            {renderResultStatus(detail.trangThai)}
          </div>

          <div>
            <span>Ngày xác nhận</span>
            <strong>{formatDate(detail.ngayXacNhan)}</strong>
          </div>
        </section>

        <section className="sr-detail-card">
          <div className="sr-card-heading">
            <Building2 size={21} />
            <h3>Đánh giá của doanh nghiệp</h3>
          </div>

          <div className="sr-detail-grid">
            <div className="sr-detail-field">
              <span>Điểm đánh giá</span>
              <strong>{formatScore(detail.diemDoanhNghiep)}</strong>
            </div>

            <div className="sr-detail-field full">
              <span>Nhận xét</span>
              <p>{detail.nhanXetDoanhNghiep || "Chưa có nhận xét."}</p>
            </div>
          </div>
        </section>

        <section className="sr-detail-card">
          <div className="sr-card-heading">
            <GraduationCap size={21} />
            <h3>Đánh giá của giảng viên</h3>
          </div>

          <div className="sr-detail-grid">
            <div className="sr-detail-field">
              <span>Điểm đánh giá</span>
              <strong>{formatScore(detail.diemGiangVien)}</strong>
            </div>

            <div className="sr-detail-field full">
              <span>Nhận xét</span>
              <p>{detail.nhanXetGiangVien || "Chưa có nhận xét."}</p>
            </div>
          </div>
        </section>

        <section className="sr-detail-card">
          <div className="sr-card-heading">
            <ClipboardCheck size={21} />
            <h3>Kết quả đối soát đánh giá</h3>
          </div>

          <div className="sr-detail-grid">
            <div className="sr-detail-field">
              <span>Kết quả đối soát</span>
              <strong>
                {detail.ketQuaDoiSoat || "Chưa có kết quả đối soát"}
              </strong>
            </div>

            <div className="sr-detail-field full">
              <span>Nhận xét đối soát</span>
              <p>{detail.nhanXetDoiSoat || "Chưa có nhận xét."}</p>
            </div>
          </div>
        </section>

        <section className="sr-detail-card">
          <div className="sr-card-heading">
            <FileText size={21} />
            <h3>Báo cáo thực tập</h3>
          </div>

          {detail.baoCao?.length > 0 ? (
            <div className="sr-report-list">
              {detail.baoCao.map((report) => (
                <div
                  className="sr-report-item"
                  key={report.maBaoCao}
                >
                  <div>
                    <strong>{report.tenBaoCao || "Báo cáo thực tập"}</strong>
                    <span>
                      Ngày nộp: {formatDate(report.ngayNop)}
                    </span>
                  </div>

                  <span
                    className={`sr-report-status ${
                      report.trangThai === "DA_DUYET"
                        ? "approved"
                        : report.trangThai === "TU_CHOI"
                        ? "rejected"
                        : "waiting"
                    }`}
                  >
                    {report.trangThai || "Chưa xác định"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="sr-empty-text">Chưa có báo cáo thực tập.</p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="sr-container">
      <div className="sr-page-heading">
        <div className="sr-heading-icon">
          <Award size={27} />
        </div>

        <div>
          <h2>Kết quả thực tập</h2>
          <p>
            Theo dõi kết quả đánh giá và xác nhận hoàn thành thực tập.
          </p>
        </div>

        <button
          className="sr-refresh-button"
          onClick={loadResults}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="sr-error">
          {error}
          <button onClick={loadResults}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="sr-message">Đang tải kết quả thực tập...</div>
      ) : results.length === 0 ? (
        <div className="sr-empty">
          <div className="sr-empty-icon">
            <Award size={34} />
          </div>

          <h3>Chưa có thông tin kết quả</h3>

          <p>
            Kết quả thực tập sẽ hiển thị tại đây sau khi bạn có quá trình
            thực tập trong hệ thống.
          </p>
        </div>
      ) : (
        <div className="sr-list">
          {results.map((item) => (
            <div className="sr-list-card" key={item.maQuaTrinh}>
              <div className="sr-list-card-top">
                <div className="sr-list-icon">
                  <CalendarDays size={23} />
                </div>

                <div className="sr-list-info">
                  <h3>Quá trình thực tập #{item.maQuaTrinh}</h3>
                  <span>Mã đăng ký: {item.maDangKy}</span>
                </div>

                {renderResultStatus(item.trangThai)}
              </div>

              <div className="sr-list-result">
                <span>Kết quả cuối cùng</span>
                <strong
                  className={
                    item.ketQua === "DAT"
                      ? "sr-result-pass"
                      : item.ketQua === "KHONG_DAT"
                      ? "sr-result-fail"
                      : ""
                  }
                >
                  {getResultLabel(item.ketQua)}
                </strong>
              </div>

              <div className="sr-list-bottom">
                <span>
                  Ngày xác nhận: {formatDate(item.ngayXacNhan)}
                </span>

                <button
                  className="sr-detail-button"
                  onClick={() => loadDetail(item.maQuaTrinh)}
                  disabled={detailLoading}
                >
                  <Eye size={17} />
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailLoading && (
        <div className="sr-loading-overlay">
          Đang tải chi tiết...
        </div>
      )}
    </div>
  );
}

export default StudentResult;
