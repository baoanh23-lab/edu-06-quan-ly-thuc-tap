
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Building2,
  GraduationCap,
  Clock3,
  BriefcaseBusiness,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

import api from "../services/api";
import "../styles/InternshipProcess.css";

function formatDate(date) {
  if (!date) return "Chưa cập nhật";

  return new Date(date + "T00:00:00").toLocaleDateString("vi-VN");
}

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

export default function InternshipProcess() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProcesses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/qua-trinh-thuc-tap/cua-toi"
      );

      setProcesses(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Lỗi tải quá trình thực tập:", err);

      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền xem quá trình thực tập.");
      } else {
        setError("Không thể tải quá trình thực tập. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  if (loading) {
    return (
      <div className="process-message">
        <RefreshCw className="process-loading-icon" size={22} />
        <span>Đang tải quá trình thực tập...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="process-message process-error">
        <p>{error}</p>

        <button onClick={loadProcesses}>
          <RefreshCw size={17} />
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="internship-process">
      <section className="process-intro">
        <div>
          <span className="process-eyebrow">
            QUẢN LÝ THỰC TẬP
          </span>

          <h2>Quá trình thực tập của tôi</h2>

          <p>
            Theo dõi thời gian, trạng thái và tiến độ thực tập
            của bạn tại doanh nghiệp.
          </p>
        </div>

        <div className="process-intro-icon">
          <CalendarDays size={55} />
        </div>
      </section>

      <div className="process-section-heading">
        <div>
          <h3>Thông tin quá trình thực tập</h3>
          <p>
            Danh sách các quá trình thực tập đã được xác nhận.
          </p>
        </div>

        <button
          className="process-refresh"
          onClick={loadProcesses}
        >
          <RefreshCw size={17} />
          Làm mới
        </button>
      </div>

      {processes.length === 0 ? (
        <div className="process-empty">
          <div className="process-empty-icon">
            <ClipboardList size={35} />
          </div>

          <h3>Chưa có quá trình thực tập</h3>

          <p>
            Quá trình thực tập sẽ xuất hiện sau khi doanh nghiệp
            và giảng viên hướng dẫn chấp nhận đơn đăng ký của bạn.
          </p>
        </div>
      ) : (
        <div className="process-list">
          {processes.map((item) => {
            const status = getStatusInfo(item.trangThai);

            return (
              <section
                className="process-card"
                key={item.maQuaTrinh}
              >
                <div className="process-card-header">
                  <div>
                    <span className="process-code">
                      QUÁ TRÌNH #{item.maQuaTrinh}
                    </span>

                    <h3>{item.tenViTri || "Vị trí thực tập"}</h3>
                  </div>

                  <span className={`process-status ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="process-info-grid">
                  <div className="process-info-item">
                    <div className="process-info-icon blue">
                      <BriefcaseBusiness size={20} />
                    </div>

                    <div>
                      <span>Mã đăng ký</span>
                      <strong>#{item.maDangKy}</strong>
                    </div>
                  </div>

                  <div className="process-info-item">
                    <div className="process-info-icon purple">
                      <GraduationCap size={20} />
                    </div>

                    <div>
                      <span>Giảng viên hướng dẫn</span>
                      <strong>{item.maGv || "Chưa cập nhật"}</strong>
                    </div>
                  </div>

                  <div className="process-info-item">
                    <div className="process-info-icon green">
                      <CalendarDays size={20} />
                    </div>

                    <div>
                      <span>Ngày bắt đầu</span>
                      <strong>{formatDate(item.ngayBatDau)}</strong>
                    </div>
                  </div>

                  <div className="process-info-item">
                    <div className="process-info-icon orange">
                      <Clock3 size={20} />
                    </div>

                    <div>
                      <span>Ngày kết thúc</span>
                      <strong>{formatDate(item.ngayKetThuc)}</strong>
                    </div>
                  </div>

                  <div className="process-info-item">
                    <div className="process-info-icon blue">
                      <Building2 size={20} />
                    </div>

                    <div>
                      <span>Mã sinh viên</span>
                      <strong>{item.maSv}</strong>
                    </div>
                  </div>
                </div>

                <div className="process-progress-section">
                  <div className="process-progress-heading">
                    <div>
                      <h4>Tiến độ thực tập</h4>
                      <p>Nội dung tiến độ được ghi nhận gần nhất.</p>
                    </div>
                  </div>

                  <div className="process-progress-content">
                    {item.tienDo ? (
                      <p>{item.tienDo}</p>
                    ) : (
                      <span>
                        Bạn chưa cập nhật nội dung tiến độ thực tập.
                      </span>
                    )}
                  </div>
                </div>

                <div className="process-card-footer">
                  <span>
                    Ngày đăng ký: {formatDate(item.ngayDangKy)}
                  </span>
                  <span>Mã quá trình: {item.maQuaTrinh}</span>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
