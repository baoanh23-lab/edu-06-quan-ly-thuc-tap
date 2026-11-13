package edu06.edu06.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ViTriThucTap")
public class ViTriThucTap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_vi_tri")
    private Long maViTri;

    @Column(name = "ma_dn", nullable = false)
    private String maDn;

    @Column(name = "ten_vi_tri", nullable = false)
    private String tenViTri;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "yeu_cau")
    private String yeuCau;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

    public ViTriThucTap() {
    }

    public Long getMaViTri() {
        return maViTri;
    }

    public void setMaViTri(Long maViTri) {
        this.maViTri = maViTri;
    }

    public String getMaDn() {
        return maDn;
    }

    public void setMaDn(String maDn) {
        this.maDn = maDn;
    }

    public String getTenViTri() {
        return tenViTri;
    }

    public void setTenViTri(String tenViTri) {
        this.tenViTri = tenViTri;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public String getYeuCau() {
        return yeuCau;
    }

    public void setYeuCau(String yeuCau) {
        this.yeuCau = yeuCau;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}