
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  FileText,
  AlertCircle,
} from "lucide-react";

import "../styles/EnterprisePositions.css";

const API_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("token");
}

// Gọi API Backend
async function requestApi(url, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
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
      throw new Error(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "Tài khoản không có quyền thực hiện chức năng này."
      );
    }

    throw new Error(
      data?.message ||
        (typeof data === "string" && data) ||
        `Lỗi máy chủ (${response.status})`
    );
  }

  return data;
}

// Form mặc định
const emptyForm = {
  tenViTri: "",
  moTa: "",
  yeuCau: "",
  soLuong: 1,
  maChuyenNganhs: [],
};

export default function EnterprisePositions() {
  // ==============================
  // 1. STATE
  // ==============================
  const [positions, setPositions] = useState([]);

  // Danh sách chuyên ngành
  const [majors, setMajors] = useState([]);
  const [loadingMajors, setLoadingMajors] = useState(false);

  const [form, setForm] = useState({ ...emptyForm });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==============================
  // 2. LẤY DANH SÁCH VỊ TRÍ
  // ==============================
  const loadPositions = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await requestApi("/doanh-nghiep/vi-tri");

      setPositions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách vị trí.");

      if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 3. LẤY DANH SÁCH CHUYÊN NGÀNH
  // ==============================
  const loadMajors = async () => {
    setLoadingMajors(true);

    try {
      const data = await requestApi("/chuyen-nganh");

      setMajors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Không thể tải danh sách chuyên ngành."
      );
    } finally {
      setLoadingMajors(false);
    }
  };

  // Tải dữ liệu khi mở trang
  useEffect(() => {
    loadPositions();
    loadMajors();
  }, []);

  // ==============================
  // 4. THỐNG KÊ VỊ TRÍ
  // ==============================
  const totalPositions = positions.length;

  const openPositions = positions.filter(
    (item) => item.trangThai === "DANG_MO"
  ).length;

  const closedPositions = positions.filter(
    (item) => item.trangThai === "DA_DONG"
  ).length;

  const totalQuantity = positions.reduce(
    (total, item) => total + (Number(item.soLuong) || 0),
    0
  );

  // ==============================
  // 5. THAY ĐỔI FORM
  // ==============================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Chọn hoặc bỏ chọn chuyên ngành
  const handleMajorChange = (maChuyenNganh) => {
    setForm((previous) => {
      const selected = previous.maChuyenNganhs || [];

      const exists = selected.includes(maChuyenNganh);

      return {
        ...previous,
        maChuyenNganhs: exists
          ? selected.filter((ma) => ma !== maChuyenNganh)
          : [...selected, maChuyenNganh],
      };
    });
  };

  // ==============================
  // 6. MỞ FORM THÊM
  // ==============================
  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // ==============================
  // 7. MỞ FORM CHỈNH SỬA
  // ==============================
  const handleEdit = (item) => {
    setEditingId(item.maViTri);

    setForm({
      tenViTri: item.tenViTri || "",
      moTa: item.moTa || "",
      yeuCau: item.yeuCau || "",
      soLuong: item.soLuong ?? 1,

      // Đảm bảo mã chuyên ngành cùng kiểu dữ liệu
      maChuyenNganhs: (item.maChuyenNganhs || []).map(String),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  // ==============================
  // 8. THÊM / CẬP NHẬT VỊ TRÍ
  // ==============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.tenViTri.trim()) {
      setError("Vui lòng nhập tên vị trí thực tập.");
      return;
    }

    if (
      !Number.isInteger(Number(form.soLuong)) ||
      Number(form.soLuong) <= 0
    ) {
      setError("Số lượng phải là số nguyên lớn hơn 0.");
      return;
    }

    if (
      !form.maChuyenNganhs ||
      form.maChuyenNganhs.length === 0
    ) {
      setError("Vui lòng chọn ít nhất một chuyên ngành.");
      return;
    }

    const payload = {
      tenViTri: form.tenViTri.trim(),
      moTa: form.moTa.trim(),
      yeuCau: form.yeuCau.trim(),
      soLuong: Number(form.soLuong),
      maChuyenNganhs: form.maChuyenNganhs,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await requestApi(
          `/doanh-nghiep/vi-tri/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setSuccess("Cập nhật vị trí thực tập thành công!");
      } else {
        await requestApi("/doanh-nghiep/vi-tri", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Thêm vị trí thực tập thành công!");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadPositions();
    } catch (err) {
      setError(err.message || "Không thể lưu vị trí thực tập.");

      if (err.message.includes("Phiên đăng nhập đã hết hạn")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // 9. ĐÓNG / MỞ VỊ TRÍ
  // ==============================
  const handleToggleStatus = async (item) => {
    const isOpen = item.trangThai === "DANG_MO";

    const newStatus = isOpen ? "DA_DONG" : "DANG_MO";

    const message = isOpen
      ? `Bạn có chắc muốn đóng vị trí "${item.tenViTri}"?`
      : `Bạn có chắc muốn mở lại vị trí "${item.tenViTri}"?`;

    if (!window.confirm(message)) return;

    setError("");
    setSuccess("");

    try {
      await requestApi(
        `/doanh-nghiep/vi-tri/${item.maViTri}/trang-thai`,
        {
          method: "PUT",
          body: JSON.stringify({
            trangThai: newStatus,
          }),
        }
      );

      setSuccess(
        isOpen
          ? "Đã đóng vị trí thực tập."
          : "Đã mở lại vị trí thực tập."
      );

      await loadPositions();
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái.");
    }
  };

  // ==============================
  // 10. XÓA VỊ TRÍ
  // ==============================
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa vị trí "${item.tenViTri}"?\n\nLưu ý: Không thể xóa nếu đã có sinh viên đăng ký.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await requestApi(
        `/doanh-nghiep/vi-tri/${item.maViTri}`,
        {
          method: "DELETE",
        }
      );

      setSuccess("Xóa vị trí thực tập thành công!");

      await loadPositions();
    } catch (err) {
      setError(err.message || "Không thể xóa vị trí.");
    }
  };

  // ==============================
  // 11. TÌM KIẾM VÀ LỌC
  // ==============================
  const filteredPositions = positions.filter((item) => {
    const keyword = search.toLowerCase().trim();

    const matchSearch =
      !keyword ||
      (item.tenViTri || "").toLowerCase().includes(keyword) ||
      (item.moTa || "").toLowerCase().includes(keyword);

    const matchStatus =
      filterStatus === "ALL" ||
      item.trangThai === filterStatus;

    return matchSearch && matchStatus;
  });

  // ==============================
  // 12. GIAO DIỆN
  // ==============================
  return (
    <div className="ep-container">

      {/* TIÊU ĐỀ */}
      <div className="ep-page-heading">
        <div>
          <div className="ep-heading-icon">
            <BriefcaseBusiness size={25} />
          </div>

          <div>
            <h2>Quản lý vị trí thực tập</h2>
            <p>
              Quản lý các vị trí tuyển thực tập của doanh nghiệp.
            </p>
          </div>
        </div>

        <button
          className="ep-btn ep-btn-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={19} />
          Thêm vị trí
        </button>
      </div>

      {/* THÔNG BÁO */}
      {error && !showForm && (
        <div className="ep-alert ep-alert-error">
          <AlertCircle size={19} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="ep-alert ep-alert-success">
          <CheckCircle size={19} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* THỐNG KÊ */}
      <div className="ep-stat-grid">
        <div className="ep-stat-card">
          <div className="ep-stat-icon blue">
            <BriefcaseBusiness size={23} />
          </div>
          <div>
            <p>Tổng vị trí</p>
            <h3>{totalPositions}</h3>
          </div>
        </div>

        <div className="ep-stat-card">
          <div className="ep-stat-icon green">
            <CheckCircle size={23} />
          </div>
          <div>
            <p>Đang mở</p>
            <h3>{openPositions}</h3>
          </div>
        </div>

        <div className="ep-stat-card">
          <div className="ep-stat-icon orange">
            <XCircle size={23} />
          </div>
          <div>
            <p>Đã đóng</p>
            <h3>{closedPositions}</h3>
          </div>
        </div>

        <div className="ep-stat-card">
          <div className="ep-stat-icon purple">
            <Users size={23} />
          </div>
          <div>
            <p>Tổng chỉ tiêu</p>
            <h3>{totalQuantity}</h3>
          </div>
        </div>
      </div>

      {/* DANH SÁCH */}
      <div className="ep-list-card">
        <div className="ep-list-heading">
          <div>
            <h3>Danh sách vị trí thực tập</h3>
            <p>
              Theo dõi và quản lý các vị trí đang tuyển dụng.
            </p>
          </div>

          <button
            className="ep-btn ep-btn-refresh"
            onClick={() => {
              loadPositions();
              loadMajors();
            }}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "ep-spin" : ""}
            />
            Làm mới
          </button>
        </div>

        {/* TÌM KIẾM */}
        <div className="ep-toolbar">
          <div className="ep-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Tìm kiếm vị trí thực tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DANG_MO">Đang mở</option>
            <option value="DA_DONG">Đã đóng</option>
          </select>
        </div>

        {/* BẢNG DỮ LIỆU */}
        {loading ? (
          <div className="ep-state">
            <RefreshCw size={30} className="ep-spin" />
            <p>Đang tải danh sách vị trí...</p>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="ep-state">
            <div className="ep-empty-icon">
              <FileText size={35} />
            </div>

            <h3>
              {positions.length === 0
                ? "Chưa có vị trí thực tập"
                : "Không tìm thấy vị trí phù hợp"}
            </h3>

            <p>
              {positions.length === 0
                ? "Hãy thêm vị trí thực tập đầu tiên cho doanh nghiệp."
                : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."}
            </p>

            {positions.length === 0 && (
              <button
                className="ep-btn ep-btn-primary"
                onClick={handleOpenAdd}
              >
                <Plus size={18} />
                Thêm vị trí ngay
              </button>
            )}
          </div>
        ) : (
          <div className="ep-table-wrapper">
            <table className="ep-table">
              <thead>
                <tr>
                  <th>Mã vị trí</th>
                  <th>Tên vị trí</th>
                  <th>Mô tả</th>
                  <th>Yêu cầu</th>
                  <th>Chuyên ngành</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredPositions.map((item) => {
                  const isOpen = item.trangThai === "DANG_MO";

                  return (
                    <tr key={item.maViTri}>
                      <td>
                        <span className="ep-id">
                          #{item.maViTri}
                        </span>
                      </td>

                      <td>
                        <div className="ep-position-name">
                          <div className="ep-position-icon">
                            <BriefcaseBusiness size={19} />
                          </div>
                          <strong>{item.tenViTri}</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          className="ep-description"
                          title={item.moTa || ""}
                        >
                          {item.moTa || "Chưa có mô tả"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="ep-description"
                          title={item.yeuCau || ""}
                        >
                          {item.yeuCau || "Chưa có yêu cầu"}
                        </span>
                      </td>

                      <td>
                        <div className="ep-major-list">
                          {item.tenChuyenNganhs &&
                          item.tenChuyenNganhs.length > 0 ? (
                            item.tenChuyenNganhs.map((ten, index) => (
                              <span
                                key={index}
                                className="ep-major-tag"
                              >
                                {ten}
                              </span>
                            ))
                          ) : (
                            <span className="ep-description">
                              Chưa chọn
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="ep-quantity">
                          <Users size={16} />
                          {item.soLuong}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ep-status ${
                            isOpen ? "open" : "closed"
                          }`}
                        >
                          {isOpen ? (
                            <CheckCircle size={15} />
                          ) : (
                            <XCircle size={15} />
                          )}
                          {isOpen ? "Đang mở" : "Đã đóng"}
                        </span>
                      </td>

                      <td>
                        <div className="ep-actions">
                          <button
                            className="ep-action-btn edit"
                            title="Chỉnh sửa"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className={`ep-action-btn ${
                              isOpen ? "close" : "open"
                            }`}
                            title={
                              isOpen ? "Đóng vị trí" : "Mở lại vị trí"
                            }
                            onClick={() => handleToggleStatus(item)}
                          >
                            {isOpen ? (
                              <Lock size={17} />
                            ) : (
                              <Unlock size={17} />
                            )}
                          </button>

                          <button
                            className="ep-action-btn delete"
                            title="Xóa vị trí"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="ep-list-footer">
          Hiển thị {filteredPositions.length} / {positions.length} vị trí
        </div>
      </div>

      {/* FORM THÊM / SỬA */}
      {showForm && (
        <div
          className="ep-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              handleCloseForm();
            }
          }}
        >
          <div className="ep-modal">
            <div className="ep-modal-heading">
              <div className="ep-modal-title">
                <div className="ep-modal-icon">
                  {editingId !== null ? (
                    <Pencil size={23} />
                  ) : (
                    <Plus size={23} />
                  )}
                </div>

                <div>
                  <h3>
                    {editingId !== null
                      ? "Cập nhật vị trí thực tập"
                      : "Thêm vị trí thực tập"}
                  </h3>

                  <p>
                    Điền thông tin vị trí tuyển thực tập bên dưới.
                  </p>
                </div>
              </div>

              <button
                className="ep-modal-close"
                onClick={handleCloseForm}
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            {error && (
              <div className="ep-alert ep-alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="ep-form-body">
                <div className="ep-form-group">
                  <label>
                    Tên vị trí thực tập
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="tenViTri"
                    placeholder="Ví dụ: Thực tập sinh Java"
                    value={form.tenViTri}
                    onChange={handleChange}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="ep-form-group">
                  <label>Mô tả công việc</label>

                  <textarea
                    name="moTa"
                    placeholder="Mô tả công việc và nhiệm vụ của thực tập sinh..."
                    value={form.moTa}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="ep-form-group">
                  <label>Yêu cầu ứng viên</label>

                  <textarea
                    name="yeuCau"
                    placeholder="Ví dụ: Biết Java cơ bản, SQL và Git..."
                    value={form.yeuCau}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="ep-form-group">
                  <label>
                    Số lượng tuyển
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="soLuong"
                    min="1"
                    step="1"
                    value={form.soLuong}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* CHỌN CHUYÊN NGÀNH */}
                <div className="ep-form-group">
                  <label>
                    Chuyên ngành tuyển dụng
                    <span>*</span>
                  </label>

                  <p className="ep-major-description">
                    Chọn những chuyên ngành phù hợp với vị trí thực tập này.
                  </p>

                  {loadingMajors ? (
                    <div className="ep-major-loading">
                      <RefreshCw size={17} className="ep-spin" />
                      Đang tải danh sách chuyên ngành...
                    </div>
                  ) : majors.length === 0 ? (
                    <div className="ep-major-empty">
                      Chưa có dữ liệu chuyên ngành. Vui lòng kiểm tra bảng
                      ChuyenNganh trong cơ sở dữ liệu.
                    </div>
                  ) : (
                    <div className="ep-major-checkbox-list">
                      {majors.map((major) => {
                        const majorId = String(major.maChuyenNganh);

                        return (
                          <label
                            key={majorId}
                            className="ep-major-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={(
                                form.maChuyenNganhs || []
                              ).includes(majorId)}
                              onChange={() => handleMajorChange(majorId)}
                              disabled={saving}
                            />

                            <span>{major.tenChuyenNganh}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <small>
                    Đã chọn {(form.maChuyenNganhs || []).length} chuyên ngành.
                  </small>
                </div>

                {editingId !== null && (
                  <div className="ep-form-note">
                    <AlertCircle size={17} />
                    <span>
                      Trạng thái vị trí được quản lý riêng bằng chức năng
                      đóng/mở sau khi lưu.
                    </span>
                  </div>
                )}
              </div>

              <div className="ep-modal-actions">
                <button
                  type="button"
                  className="ep-btn ep-btn-cancel"
                  onClick={handleCloseForm}
                  disabled={saving}
                >
                  <X size={17} />
                  Hủy
                </button>

                <button
                  type="submit"
                  className="ep-btn ep-btn-primary"
                  disabled={saving || loadingMajors || majors.length === 0}
                >
                  {saving ? (
                    <RefreshCw size={17} className="ep-spin" />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving
                    ? "Đang lưu..."
                    : editingId !== null
                    ? "Lưu thay đổi"
                    : "Thêm vị trí"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
