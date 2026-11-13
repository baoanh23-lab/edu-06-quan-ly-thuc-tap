
package edu06.edu06.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "KetQua")
public class KetQua {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_ket_qua")
    private Long maKetQua;

    @Column(name = "ma_qua_trinh", nullable = false, unique = true)
    private Long maQuaTrinh;

    @Column(name = "ma_gv", nullable = false, length = 20)
    private String maGv;

    @Column(name = "ket_qua", nullable = false, length = 100)
    private String ketQua;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai = "CHUA_XAC_NHAN";

    @Column(name = "ngay_xac_nhan")
    private LocalDateTime ngayXacNhan;

    public KetQua() {
    }

    public Long getMaKetQua() {
        return maKetQua;
    }

    public void setMaKetQua(Long maKetQua) {
        this.maKetQua = maKetQua;
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

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getNgayXacNhan() {
        return ngayXacNhan;
    }

    public void setNgayXacNhan(LocalDateTime ngayXacNhan) {
        this.ngayXacNhan = ngayXacNhan;
    }
}
