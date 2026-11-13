package edu06.edu06.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "SinhVien")
public class SinhVien {

    @Id
    @Column(name = "ma_sv")
    private String maSv;

    @Column(name = "id_tai_khoan")
    private Long idTaiKhoan;

    @Column(name = "ho_ten")
    private String hoTen;

    @Column(name = "email")
    private String email;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    // Chuyen nganh cua sinh vien
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ma_chuyen_nganh")
    private ChuyenNganh chuyenNganh;

    public SinhVien() {
    }

    public String getMaSv() {
        return maSv;
    }

    public Long getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public String getHoTen() {
        return hoTen;
    }

    public String getEmail() {
        return email;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public ChuyenNganh getChuyenNganh() {
        return chuyenNganh;
    }
}