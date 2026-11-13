package edu06.edu06.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ChuyenNganh")
public class ChuyenNganh {

    @Id
    @Column(name = "ma_chuyen_nganh")
    private String maChuyenNganh;

    @Column(name = "ten_chuyen_nganh")
    private String tenChuyenNganh;

    @Column(name = "mo_ta")
    private String moTa;

    public ChuyenNganh() {
    }

    public String getMaChuyenNganh() {
        return maChuyenNganh;
    }

    public void setMaChuyenNganh(String maChuyenNganh) {
        this.maChuyenNganh = maChuyenNganh;
    }

    public String getTenChuyenNganh() {
        return tenChuyenNganh;
    }

    public void setTenChuyenNganh(String tenChuyenNganh) {
        this.tenChuyenNganh = tenChuyenNganh;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
}