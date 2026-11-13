
package edu06.edu06.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DoiSoatDanhGia")
public class DoiSoatDanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_doi_soat")
    private Long maDoiSoat;

    @Column(name = "ma_qua_trinh", nullable = false)
    private Long maQuaTrinh;

    @Column(name = "ma_gv", nullable = false, length = 20)
    private String maGv;

    @Column(name = "ket_qua", nullable = false, length = 50)
    private String ketQua;

    @Column(name = "nhan_xet")
    private String nhanXet;

    @Column(name = "ngay_doi_soat", nullable = false)
    private LocalDateTime ngayDoiSoat;

    public DoiSoatDanhGia() {
    }

    public Long getMaDoiSoat() {
        return maDoiSoat;
    }

    public void setMaDoiSoat(Long maDoiSoat) {
        this.maDoiSoat = maDoiSoat;
    }

    public Long getMaQuaTrinh() {
        return maQuaTrinh;
    }

    public void setMaQuaTrinh(Long maQuaTrinh) {
        this.maQuaTrinh = maQuaTrinh;
    }

    public String getMaGv() {
        return maGv;
    }

    public void setMaGv(String maGv) {
        this.maGv = maGv;
    }

    public String getKetQua() {
        return ketQua;
    }

    public void setKetQua(String ketQua) {
        this.ketQua = ketQua;
    }

    public String getNhanXet() {
        return nhanXet;
    }

    public void setNhanXet(String nhanXet) {
        this.nhanXet = nhanXet;
    }

    public LocalDateTime getNgayDoiSoat() {
        return ngayDoiSoat;
    }

    public void setNgayDoiSoat(LocalDateTime ngayDoiSoat) {
        this.ngayDoiSoat = ngayDoiSoat;
    }
}
