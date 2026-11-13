package edu06.edu06.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DanhGia")
public class DanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_danh_gia")
    private Long maDanhGia;

    @Column(name = "ma_qua_trinh", nullable = false)
    private Long maQuaTrinh;

    @Column(name = "ma_dn", length = 20)
    private String maDn;

    @Column(name = "ma_gv", length = 20)
    private String maGv;

    @Column(name = "noi_dung")
    private String noiDung;

    @Column(name = "diem", nullable = false, precision = 4, scale = 2)
    private BigDecimal diem;

    @Column(name = "ngay_danh_gia", nullable = false)
    private LocalDateTime ngayDanhGia;

    @Column(name = "loai_danh_gia", nullable = false, length = 30)
    private String loaiDanhGia;

    public DanhGia() {
    }

    public Long getMaDanhGia() {
        return maDanhGia;
    }

    public void setMaDanhGia(Long maDanhGia) {
        this.maDanhGia = maDanhGia;
    }

    public Long getMaQuaTrinh() {
        return maQuaTrinh;
    }

    public void setMaQuaTrinh(Long maQuaTrinh) {
        this.maQuaTrinh = maQuaTrinh;
    }

    public String getMaDn() {
        return maDn;
    }

    public void setMaDn(String maDn) {
        this.maDn = maDn;
    }

    public String getMaGv() {
        return maGv;
    }

    public void setMaGv(String maGv) {
        this.maGv = maGv;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public BigDecimal getDiem() {
        return diem;
    }

    public void setDiem(BigDecimal diem) {
        this.diem = diem;
    }

    public LocalDateTime getNgayDanhGia() {
        return ngayDanhGia;
    }

    public void setNgayDanhGia(LocalDateTime ngayDanhGia) {
        this.ngayDanhGia = ngayDanhGia;
    }

    public String getLoaiDanhGia() {
        return loaiDanhGia;
    }

    public void setLoaiDanhGia(String loaiDanhGia) {
        this.loaiDanhGia = loaiDanhGia;
    }
}