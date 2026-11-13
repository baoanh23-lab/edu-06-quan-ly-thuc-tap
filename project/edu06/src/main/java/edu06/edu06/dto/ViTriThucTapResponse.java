
package edu06.edu06.dto;

public class ViTriThucTapResponse {

    private Long maViTri;
    private String maDn;
    private String tenDn;
    private String diaChi;
    private String tenViTri;
    private String moTa;
    private String yeuCau;
    private Integer soLuong;
    private String trangThai;

    public ViTriThucTapResponse(
            Long maViTri,
            String maDn,
            String tenDn,
            String diaChi,
            String tenViTri,
            String moTa,
            String yeuCau,
            Integer soLuong,
            String trangThai
    ) {
        this.maViTri = maViTri;
        this.maDn = maDn;
        this.tenDn = tenDn;
        this.diaChi = diaChi;
        this.tenViTri = tenViTri;
        this.moTa = moTa;
        this.yeuCau = yeuCau;
        this.soLuong = soLuong;
        this.trangThai = trangThai;
    }

    public Long getMaViTri() {
        return maViTri;
    }

    public String getMaDn() {
        return maDn;
    }

    public String getTenDn() {
        return tenDn;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public String getTenViTri() {
        return tenViTri;
    }

    public String getMoTa() {
        return moTa;
    }

    public String getYeuCau() {
        return yeuCau;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public String getTrangThai() {
        return trangThai;
    }
}
