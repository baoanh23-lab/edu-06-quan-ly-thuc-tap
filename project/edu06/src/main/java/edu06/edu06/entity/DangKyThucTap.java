package edu06.edu06.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DangKyThucTap")
public class DangKyThucTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_dang_ky")
    private Long maDangKy;

    @Column(name = "ma_sv", nullable = false, length = 20)
    private String maSv;

    @Column(name = "ma_vi_tri", nullable = false)
    private Long maViTri;

    @Column(name = "ma_gv", length = 20)
    private String maGv;

    @Column(name = "ngay_dang_ky", nullable = false)
    private LocalDate ngayDangKy;

    @Column(name = "noi_dung")
    private String noiDung;

    // Trạng thái tổng thể của đăng ký
    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    // Trạng thái duyệt của giảng viên
    @Column(name = "trang_thai_gv", nullable = false, length = 30)
    private String trangThaiGv;

    // Trạng thái duyệt của doanh nghiệp
    @Column(name = "trang_thai_dn", nullable = false, length = 30)
    private String trangThaiDn;

    public DangKyThucTap() {
    }

    public Long getMaDangKy() {
        return maDangKy;
    }

    public void setMaDangKy(Long maDangKy) {
        this.maDangKy = maDangKy;
    }

    public String getMaSv() {
        return maSv;
    }

    public void setMaSv(String maSv) {
        this.maSv = maSv;
    }

    public Long getMaViTri() {
        return maViTri;
    }

    public void setMaViTri(Long maViTri) {
        this.maViTri = maViTri;
    }

    public String getMaGv() {
        return maGv;
    }

    public void setMaGv(String maGv) {
        this.maGv = maGv;
    }

    public LocalDate getNgayDangKy() {
        return ngayDangKy;
    }

    public void setNgayDangKy(LocalDate ngayDangKy) {
        this.ngayDangKy = ngayDangKy;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getTrangThaiGv() {
        return trangThaiGv;
    }

    public void setTrangThaiGv(String trangThaiGv) {
        this.trangThaiGv = trangThaiGv;
    }

    public String getTrangThaiDn() {
        return trangThaiDn;
    }

    public void setTrangThaiDn(String trangThaiDn) {
        this.trangThaiDn = trangThaiDn;
    }
}