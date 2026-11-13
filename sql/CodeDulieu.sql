
-- =====================================================
-- DU LIEU MAU EDU-06 - SQL SERVER
-- Chi chay sau khi da tao 13 bang
-- =====================================================

-- 1. TAI KHOAN
INSERT INTO TaiKhoan (username, password, vai_tro)
VALUES
('sv001', '123456', 'SINH_VIEN'),
('sv002', '123456', 'SINH_VIEN'),
('dn001', '123456', 'DOANH_NGHIEP'),
('gv001', '123456', 'GIANG_VIEN');

-- 2. SINH VIEN
INSERT INTO SinhVien
    (ma_sv, id_tai_khoan, ho_ten, email, so_dien_thoai)
VALUES
('SV001', 1, N'Nguyen Van An', 'sv001@example.com', '0901000001'),
('SV002', 2, N'Tran Thi Binh', 'sv002@example.com', '0901000002');

-- 3. DOANH NGHIEP
INSERT INTO DoanhNghiep
    (ma_dn, id_tai_khoan, ten_dn, email, dia_chi, so_dien_thoai)
VALUES
('DN001', 3, N'Cong ty Cong nghe ABC',
 'dn001@example.com', N'Quan 7, TP Ho Chi Minh', '0902000001');

-- 4. GIANG VIEN
INSERT INTO GiangVien
    (ma_gv, id_tai_khoan, ho_ten, email, so_dien_thoai)
VALUES
('GV001', 4, N'Le Thi Hoa', 'gv001@example.com', '0903000001');

-- 5. VI TRI THUC TAP
INSERT INTO ViTriThucTap
    (ma_dn, ten_vi_tri, mo_ta, yeu_cau, so_luong, trang_thai)
VALUES
('DN001', N'Thuc tap sinh lap trinh web',
 N'Tham gia phat trien ung dung web.',
 N'Biet co ban HTML, CSS, JavaScript va SQL.',
 5, 'DANG_MO');

-- 6. DANG KY THUC TAP
INSERT INTO DangKyThucTap
    (ma_sv, ma_vi_tri, ma_gv, noi_dung, trang_thai)
VALUES
('SV001', 1, 'GV001',
 N'Dang ky thuc tap lap trinh web.',
 'DA_DUYET'),
('SV002', 1, 'GV001',
 N'Dang ky thuc tap phat trien ung dung.',
 'DA_DUYET');

-- 7. QUA TRINH THUC TAP
INSERT INTO QuaTrinhThucTap
    (ma_dang_ky, ngay_bat_dau, ngay_ket_thuc, tien_do, trang_thai)
VALUES
(1, '2026-10-01', '2026-12-01',
 N'Dang lam quen voi du an va cong nghe.',
 'DANG_THUC_TAP'),
(2, '2026-10-01', '2026-12-01',
 N'Dang nghien cuu yeu cau he thong.',
 'DANG_THUC_TAP');

-- 8. NHAT KY
INSERT INTO NhatKy
    (ma_qua_trinh, ngay, noi_dung)
VALUES
(1, '2026-10-02',
 N'Tim hieu quy trinh lam viec va cong nghe cua doanh nghiep.'),
(1, '2026-10-09',
 N'Thiet ke giao dien va tim hieu API.'),
(2, '2026-10-03',
 N'Phan tich yeu cau va lap ke hoach thuc tap.');

-- 9. MINH CHUNG
INSERT INTO MinhChung
    (ma_nhat_ky, ten_file, duong_dan)
VALUES
(1, 'nhatky_tuan1.pdf', 'uploads/minhchung/nhatky_tuan1.pdf'),
(2, 'giaodien_web.png', 'uploads/minhchung/giaodien_web.png'),
(3, 'kehoach_thuctap.pdf', 'uploads/minhchung/kehoach_thuctap.pdf');

-- 10. BAO CAO
INSERT INTO BaoCao
    (ma_qua_trinh, ten_bao_cao, duong_dan, trang_thai)
VALUES
(1, N'Bao cao thuc tap SV001',
 'uploads/baocao/baocao_sv001.pdf', 'CHO_DUYET'),
(2, N'Bao cao thuc tap SV002',
 'uploads/baocao/baocao_sv002.pdf', 'CHO_DUYET');

-- 11. DANH GIA
INSERT INTO DanhGia
    (ma_qua_trinh, ma_dn, ma_gv, noi_dung, diem, loai_danh_gia)
VALUES
(1, 'DN001', NULL,
 N'Danh gia mau tu doanh nghiep.', 8.50, 'DOANH_NGHIEP'),
(1, NULL, 'GV001',
 N'Danh gia mau tu giang vien.', 8.00, 'GIANG_VIEN'),
(2, 'DN001', NULL,
 N'Danh gia mau tu doanh nghiep.', 7.50, 'DOANH_NGHIEP'),
(2, NULL, 'GV001',
 N'Danh gia mau tu giang vien.', 8.00, 'GIANG_VIEN');

-- 12. DOI SOAT DANH GIA
INSERT INTO DoiSoatDanhGia
    (ma_qua_trinh, ma_gv, ket_qua, nhan_xet)
VALUES
(1, 'GV001', N'KHOP',
 N'Diem danh gia cua doanh nghiep va giang vien gan nhau.'),
(2, 'GV001', N'CAN_XEM_XET',
 N'Can kiem tra them minh chung va noi dung danh gia.');

-- 13. KET QUA
INSERT INTO KetQua
    (ma_qua_trinh, ma_gv, ket_qua, trang_thai, ngay_xac_nhan)
VALUES
(1, 'GV001', N'DAT', 'DA_XAC_NHAN', SYSDATETIME()),
(2, 'GV001', N'CHO_XAC_NHAN', 'CHUA_XAC_NHAN', NULL);

-- 1. Them danh sach chuyen nganh
IF NOT EXISTS (
    SELECT 1 FROM ChuyenNganh
    WHERE ma_chuyen_nganh = 'CNTT'
)
BEGIN
    INSERT INTO ChuyenNganh
        (ma_chuyen_nganh, ten_chuyen_nganh, mo_ta)
    VALUES
        ('CNTT', N'Công nghệ thông tin',
         N'Đào tạo về lập trình, phát triển phần mềm và hệ thống máy tính.');
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM ChuyenNganh
    WHERE ma_chuyen_nganh = 'HTTT'
)
BEGIN
    INSERT INTO ChuyenNganh
        (ma_chuyen_nganh, ten_chuyen_nganh, mo_ta)
    VALUES
        ('HTTT', N'Hệ thống thông tin',
         N'Đào tạo về phân tích, thiết kế và quản lý hệ thống thông tin.');
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM ChuyenNganh
    WHERE ma_chuyen_nganh = 'KT'
)
BEGIN
    INSERT INTO ChuyenNganh
        (ma_chuyen_nganh, ten_chuyen_nganh, mo_ta)
    VALUES
        ('KT', N'Kế toán',
         N'Đào tạo về kế toán và quản lý tài chính.');
END;
GO

UPDATE SinhVien
SET ma_chuyen_nganh = 'CNTT'
WHERE ma_sv = 'SV001';

UPDATE SinhVien
SET ma_chuyen_nganh = 'HTTT'
WHERE ma_sv = 'SV002';
GO




-- =====================================================
-- KIEM TRA SO LUONG DU LIEU
-- =====================================================
SELECT N'TaiKhoan' AS TenBang, COUNT(*) AS SoLuong FROM TaiKhoan
UNION ALL SELECT N'SinhVien', COUNT(*) FROM SinhVien
UNION ALL SELECT N'DoanhNghiep', COUNT(*) FROM DoanhNghiep
UNION ALL SELECT N'GiangVien', COUNT(*) FROM GiangVien
UNION ALL SELECT N'ViTriThucTap', COUNT(*) FROM ViTriThucTap
UNION ALL SELECT N'DangKyThucTap', COUNT(*) FROM DangKyThucTap
UNION ALL SELECT N'QuaTrinhThucTap', COUNT(*) FROM QuaTrinhThucTap
UNION ALL SELECT N'NhatKy', COUNT(*) FROM NhatKy
UNION ALL SELECT N'MinhChung', COUNT(*) FROM MinhChung
UNION ALL SELECT N'BaoCao', COUNT(*) FROM BaoCao
UNION ALL SELECT N'DanhGia', COUNT(*) FROM DanhGia
UNION ALL SELECT N'DoiSoatDanhGia', COUNT(*) FROM DoiSoatDanhGia
UNION ALL SELECT N'KetQua', COUNT(*) FROM KetQua;
GO
