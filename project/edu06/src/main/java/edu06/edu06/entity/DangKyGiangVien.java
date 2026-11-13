
package edu06.edu06.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DangKyGiangVien")
public class DangKyGiangVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_dang_ky_gv")
    private Long maDangKyGv;

    @Column(name = "ma_sv", nullable = false, length = 20)
    private String maSv;

    @Column(name = "ma_gv", nullable = false, length = 20)
    private String maGv;

    @Column(name = "ngay_dang_ky", nullable = false)
    private LocalDate ngayDangKy;

    @Column(name = "noi_dung")
    private String noiDung;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    public DangKyGiangVien() {
    }

    public Long getMaDangKyGv() {
        return maDangKyGv;
    }

    public void setMaDangKyGv(Long maDangKyGv) {
        this.maDangKyGv = maDangKyGv;
    }

    public String getMaSv() {
        return maSv;
    }

    public void setMaSv(String maSv) {
        this.maSv = maSv;
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
}
