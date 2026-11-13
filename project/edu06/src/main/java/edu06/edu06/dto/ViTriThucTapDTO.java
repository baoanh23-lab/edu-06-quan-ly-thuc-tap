package edu06.edu06.dto;

import java.util.List;

public class ViTriThucTapDTO {

    private Long maViTri;
    private String maDn;
    private String tenViTri;
    private String moTa;
    private String yeuCau;
    private Integer soLuong;
    private String trangThai;

    private List<String> maChuyenNganhs;
    private List<String> tenChuyenNganhs;

    public ViTriThucTapDTO() {
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

    public List<String> getMaChuyenNganhs() {
        return maChuyenNganhs;
    }

    public void setMaChuyenNganhs(List<String> maChuyenNganhs) {
        this.maChuyenNganhs = maChuyenNganhs;
    }

    public List<String> getTenChuyenNganhs() {
        return tenChuyenNganhs;
    }

    public void setTenChuyenNganhs(List<String> tenChuyenNganhs) {
        this.tenChuyenNganhs = tenChuyenNganhs;
    }
}