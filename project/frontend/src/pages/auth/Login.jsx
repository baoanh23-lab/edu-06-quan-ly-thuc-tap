
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, UserRound, GraduationCap } from "lucide-react";
import { login } from "../../services/authService";
import "../../styles/Login.css";

const roleRoutes = {
  SINH_VIEN: "/sinh-vien",
  DOANH_NGHIEP: "/doanh-nghiep",
  GIANG_VIEN: "/giang-vien",
};

const roleNames = {
  SINH_VIEN: "Sinh viên",
  DOANH_NGHIEP: "Doanh nghiệp",
  GIANG_VIEN: "Giảng viên",
};

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const data = await login(username.trim(), password);

      if (!data.token || !roleRoutes[data.vaiTro]) {
        setError("Thông tin phản hồi từ máy chủ không hợp lệ.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          vaiTro: data.vaiTro,
        })
      );

      navigate(roleRoutes[data.vaiTro], { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền thực hiện thao tác này.");
      } else {
        setError(
          "Không thể kết nối máy chủ. Hãy kiểm tra backend có đang chạy không."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-logo">
          <GraduationCap size={30} strokeWidth={2} />
        </div>

        <p className="brand-eyebrow">EDU-06 · CỔNG THÔNG TIN</p>
        <h1>Quản lý thực tập<br />và đánh giá doanh nghiệp</h1>

        <p className="brand-description">
          Kết nối sinh viên, doanh nghiệp và giảng viên trong suốt quá trình
          thực tập — từ đăng ký, theo dõi đến đánh giá kết quả.
        </p>

        <div className="brand-bottom">
          <span className="brand-dot" />
          Hệ thống quản lý thực tập trực tuyến
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="mobile-logo">
            <GraduationCap size={28} />
            <span>EDU-06</span>
          </div>

          <p className="form-eyebrow">CHÀO MỪNG BẠN</p>
          <h2>Đăng nhập</h2>
          <p className="form-description">
            Đăng nhập để tiếp tục sử dụng hệ thống.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="login-input">
              <UserRound size={19} />
              <input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <label htmlFor="password">Mật khẩu</label>
            <div className="login-input">
              <LockKeyhole size={19} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="role-note">
            <LockKeyhole size={16} />
            <span>
              Hệ thống tự xác định quyền truy cập dựa trên tài khoản của bạn.
            </span>
          </div>

          <p className="login-footer">
            EDU-06 · Cổng quản lý thực tập
          </p>
        </div>
      </section>
    </main>
  );
}