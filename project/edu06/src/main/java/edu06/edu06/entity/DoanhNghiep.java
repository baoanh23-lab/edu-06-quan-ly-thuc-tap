
package edu06.edu06.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DoanhNghiep")
public class DoanhNghiep {

    @Id
    @Column(name = "ma_dn")
    private String maDn;

    @Column(name = "id_tai_khoan")
    private Long idTaiKhoan;

    @Column(name = "ten_dn")
    private String tenDn;

    @Column(name = "email")
    private String email;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    public DoanhNghiep() {
    }

    public String getMaDn() {
        return maDn;
    }

    public void setMaDn(String maDn) {
        this.maDn = maDn;
    }

    public Long getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(Long idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public String getTenDn() {
        return tenDn;
    }

    public void setTenDn(String tenDn) {
        this.tenDn = tenDn;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }
}
