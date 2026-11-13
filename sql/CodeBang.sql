
-- =====================================================
-- DATABASE EDU-06: CONG QUAN LY THUC TAP
-- He quan tri CSDL: Microsoft SQL Server
-- =====================================================

-- 1. BANG TAI KHOAN
CREATE TABLE TaiKhoan (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(30) NOT NULL,

    CONSTRAINT chk_tai_khoan_vai_tro
        CHECK (vai_tro IN ('SINH_VIEN', 'DOANH_NGHIEP', 'GIANG_VIEN'))
);
GO

-- 2. BANG SINH VIEN
CREATE TABLE SinhVien (
    ma_sv VARCHAR(20) PRIMARY KEY,
    id_tai_khoan BIGINT NOT NULL UNIQUE,
    ho_ten NVARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),

    CONSTRAINT fk_sinh_vien_tai_khoan
        FOREIGN KEY (id_tai_khoan) REFERENCES TaiKhoan(id)
);
GO

-- 3. BANG DOANH NGHIEP
CREATE TABLE DoanhNghiep (
    ma_dn VARCHAR(20) PRIMARY KEY,
    id_tai_khoan BIGINT NOT NULL UNIQUE,
    ten_dn NVARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    dia_chi NVARCHAR(MAX),
    so_dien_thoai VARCHAR(20),

    CONSTRAINT fk_doanh_nghiep_tai_khoan
        FOREIGN KEY (id_tai_khoan) REFERENCES TaiKhoan(id)
);
GO

-- 4. BANG GIANG VIEN
CREATE TABLE GiangVien (
    ma_gv VARCHAR(20) PRIMARY KEY,
    id_tai_khoan BIGINT NOT NULL UNIQUE,
    ho_ten NVARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    so_dien_thoai VARCHAR(20),

    CONSTRAINT fk_giang_vien_tai_khoan
        FOREIGN KEY (id_tai_khoan) REFERENCES TaiKhoan(id)
);
GO

-- 5. BANG VI TRI THUC TAP
CREATE TABLE ViTriThucTap (
    ma_vi_tri BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_dn VARCHAR(20) NOT NULL,
    ten_vi_tri NVARCHAR(200) NOT NULL,
    mo_ta NVARCHAR(MAX),
    yeu_cau NVARCHAR(MAX),
    so_luong INT NOT NULL,
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'DANG_MO',

    CONSTRAINT fk_vi_tri_doanh_nghiep
        FOREIGN KEY (ma_dn) REFERENCES DoanhNghiep(ma_dn),

    CONSTRAINT chk_vi_tri_so_luong
        CHECK (so_luong > 0)
);
GO

-- 6. BANG DANG KY THUC TAP
CREATE TABLE DangKyThucTap (
    ma_dang_ky BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_sv VARCHAR(20) NOT NULL,
    ma_vi_tri BIGINT NOT NULL,
    ma_gv VARCHAR(20),
    ngay_dang_ky DATE NOT NULL DEFAULT (CAST(GETDATE() AS DATE)),
    noi_dung NVARCHAR(MAX),
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHO_DUYET',

    CONSTRAINT fk_dang_ky_sinh_vien
        FOREIGN KEY (ma_sv) REFERENCES SinhVien(ma_sv),

    CONSTRAINT fk_dang_ky_vi_tri
        FOREIGN KEY (ma_vi_tri) REFERENCES ViTriThucTap(ma_vi_tri),

    CONSTRAINT fk_dang_ky_giang_vien
        FOREIGN KEY (ma_gv) REFERENCES GiangVien(ma_gv)
);
GO

-- 7. BANG QUA TRINH THUC TAP
CREATE TABLE QuaTrinhThucTap (
    ma_qua_trinh BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_dang_ky BIGINT NOT NULL UNIQUE,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    tien_do NVARCHAR(MAX),
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHUA_BAT_DAU',

    CONSTRAINT fk_qua_trinh_dang_ky
        FOREIGN KEY (ma_dang_ky) REFERENCES DangKyThucTap(ma_dang_ky),

    CONSTRAINT chk_qua_trinh_thoi_gian
        CHECK (ngay_bat_dau <= ngay_ket_thuc)
);
GO

-- 8. BANG NHAT KY
CREATE TABLE NhatKy (
    ma_nhat_ky BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_qua_trinh BIGINT NOT NULL,
    ngay DATE NOT NULL DEFAULT (CAST(GETDATE() AS DATE)),
    noi_dung NVARCHAR(MAX) NOT NULL,

    CONSTRAINT fk_nhat_ky_qua_trinh
        FOREIGN KEY (ma_qua_trinh) REFERENCES QuaTrinhThucTap(ma_qua_trinh)
);
GO

-- 9. BANG MINH CHUNG
CREATE TABLE MinhChung (
    ma_minh_chung BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_nhat_ky BIGINT NOT NULL,
    ten_file NVARCHAR(255) NOT NULL,
    duong_dan NVARCHAR(MAX) NOT NULL,
    ngay_nop DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT fk_minh_chung_nhat_ky
        FOREIGN KEY (ma_nhat_ky) REFERENCES NhatKy(ma_nhat_ky)
);
GO

-- 10. BANG BAO CAO
CREATE TABLE BaoCao (
    ma_bao_cao BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_qua_trinh BIGINT NOT NULL,
    ten_bao_cao NVARCHAR(255) NOT NULL,
    duong_dan NVARCHAR(MAX) NOT NULL,
    ngay_nop DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHO_DUYET',

    CONSTRAINT fk_bao_cao_qua_trinh
        FOREIGN KEY (ma_qua_trinh) REFERENCES QuaTrinhThucTap(ma_qua_trinh)
);
GO

-- 11. BANG DANH GIA
CREATE TABLE DanhGia (
    ma_danh_gia BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_qua_trinh BIGINT NOT NULL,
    ma_dn VARCHAR(20),
    ma_gv VARCHAR(20),
    noi_dung NVARCHAR(MAX),
    diem NUMERIC(4,2) NOT NULL,
    ngay_danh_gia DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    loai_danh_gia VARCHAR(30) NOT NULL,

    CONSTRAINT fk_danh_gia_qua_trinh
        FOREIGN KEY (ma_qua_trinh) REFERENCES QuaTrinhThucTap(ma_qua_trinh),

    CONSTRAINT fk_danh_gia_doanh_nghiep
        FOREIGN KEY (ma_dn) REFERENCES DoanhNghiep(ma_dn),

    CONSTRAINT fk_danh_gia_giang_vien
        FOREIGN KEY (ma_gv) REFERENCES GiangVien(ma_gv),

    CONSTRAINT chk_danh_gia_diem
        CHECK (diem >= 0 AND diem <= 10),

    CONSTRAINT chk_danh_gia_loai
        CHECK (loai_danh_gia IN ('DOANH_NGHIEP', 'GIANG_VIEN')),

    CONSTRAINT chk_danh_gia_nguoi_danh_gia
        CHECK (
            (loai_danh_gia = 'DOANH_NGHIEP'
                AND ma_dn IS NOT NULL AND ma_gv IS NULL)
            OR
            (loai_danh_gia = 'GIANG_VIEN'
                AND ma_gv IS NOT NULL AND ma_dn IS NULL)
        ),

    CONSTRAINT uq_danh_gia_qua_trinh_loai
        UNIQUE (ma_qua_trinh, loai_danh_gia)
);
GO

-- 12. BANG DOI SOAT DANH GIA
CREATE TABLE DoiSoatDanhGia (
    ma_doi_soat BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_qua_trinh BIGINT NOT NULL,
    ma_gv VARCHAR(20) NOT NULL,
    ket_qua NVARCHAR(50) NOT NULL,
    nhan_xet NVARCHAR(MAX),
    ngay_doi_soat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT fk_doi_soat_qua_trinh
        FOREIGN KEY (ma_qua_trinh) REFERENCES QuaTrinhThucTap(ma_qua_trinh),

    CONSTRAINT fk_doi_soat_giang_vien
        FOREIGN KEY (ma_gv) REFERENCES GiangVien(ma_gv)
);
GO

-- 13. BANG KET QUA
CREATE TABLE KetQua (
    ma_ket_qua BIGINT IDENTITY(1,1) PRIMARY KEY,
    ma_qua_trinh BIGINT NOT NULL UNIQUE,
    ma_gv VARCHAR(20) NOT NULL,
    ket_qua NVARCHAR(100) NOT NULL,
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHUA_XAC_NHAN',
    ngay_xac_nhan DATETIME2 NULL,

    CONSTRAINT fk_ket_qua_qua_trinh
        FOREIGN KEY (ma_qua_trinh) REFERENCES QuaTrinhThucTap(ma_qua_trinh),

    CONSTRAINT fk_ket_qua_giang_vien
        FOREIGN KEY (ma_gv) REFERENCES GiangVien(ma_gv)
);
GO
-- 14. BANG CHUYEN NGANH
CREATE TABLE ChuyenNganh (
    ma_chuyen_nganh VARCHAR(20) PRIMARY KEY,
    ten_chuyen_nganh NVARCHAR(150) NOT NULL,
    mo_ta NVARCHAR(MAX)
);
GO

-- THEM CHUYEN NGANH CHO SINH VIEN
ALTER TABLE SinhVien
ADD ma_chuyen_nganh VARCHAR(20) NULL;
GO

ALTER TABLE SinhVien
ADD CONSTRAINT FK_SinhVien_ChuyenNganh
FOREIGN KEY (ma_chuyen_nganh)
REFERENCES ChuyenNganh(ma_chuyen_nganh);
GO

-- 15. BANG LIEN KET VI TRI THUC TAP VA CHUYEN NGANH
CREATE TABLE ViTri_ChuyenNganh (
    ma_vi_tri BIGINT NOT NULL,
    ma_chuyen_nganh VARCHAR(20) NOT NULL,

    CONSTRAINT PK_ViTri_ChuyenNganh
        PRIMARY KEY (ma_vi_tri, ma_chuyen_nganh),

    CONSTRAINT FK_VTCN_ViTri
        FOREIGN KEY (ma_vi_tri)
        REFERENCES ViTriThucTap(ma_vi_tri),

    CONSTRAINT FK_VTCN_ChuyenNganh
        FOREIGN KEY (ma_chuyen_nganh)
        REFERENCES ChuyenNganh(ma_chuyen_nganh)
);
GO


-- Thêm v? trí th?c t?p CNTT cho DN001
DECLARE @MaViTri BIGINT;

INSERT INTO dbo.ViTriThucTap (
    ma_dn,
    ten_vi_tri,
    mo_ta,
    yeu_cau,
    so_luong,
    trang_thai
)
VALUES (
    'DN001',
    N'Th?c t?p sinh phát tri?n ph?n m?m',
    N'Tham gia phát tri?n ?ng d?ng web, xây d?ng giao di?n và làm vi?c v?i c? s? d? li?u.',
    N'Có ki?n th?c c? b?n v? HTML, CSS, JavaScript, l?p trình và SQL.',
    3,
    'DANG_MO'
);

SET @MaViTri = SCOPE_IDENTITY();

-- Liên k?t v? trí v?a t?o v?i ngành CNTT
INSERT INTO dbo.ViTri_ChuyenNganh (
    ma_vi_tri,
    ma_chuyen_nganh
)
VALUES (
    @MaViTri,
    'CNTT'
);
ALTER TABLE DangKyThucTap
ADD
    trang_thai_gv VARCHAR(30) NOT NULL
        DEFAULT 'CHO_DUYET',

    trang_thai_dn VARCHAR(30) NOT NULL
        DEFAULT 'CHUA_GUI';
GO

CREATE TABLE DangKyGiangVien (
    ma_dang_ky_gv BIGINT IDENTITY(1,1) PRIMARY KEY,

    ma_sv VARCHAR(20) NOT NULL,
    ma_gv VARCHAR(20) NOT NULL,

    ngay_dang_ky DATE NOT NULL DEFAULT GETDATE(),

    noi_dung NVARCHAR(MAX),

    trang_thai VARCHAR(30) NOT NULL
        DEFAULT 'CHO_DUYET',

    CONSTRAINT FK_DangKyGiangVien_SinhVien
        FOREIGN KEY (ma_sv)
        REFERENCES SinhVien(ma_sv),

    CONSTRAINT FK_DangKyGiangVien_GiangVien
        FOREIGN KEY (ma_gv)
        REFERENCES GiangVien(ma_gv)
);
GO
-- KIEM TRA CAC BANG DA TAO
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
