
package edu06.edu06.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "BaoCao")
public class BaoCao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_bao_cao")
    private Long maBaoCao;

    @Column(name = "ma_qua_trinh", nullable = false)
    private Long maQuaTrinh;

    @Column(name = "ten_bao_cao", nullable = false, length = 255)
    private String tenBaoCao;

    @Column(name = "duong_dan", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String duongDan;

    @Column(name = "ngay_nop", nullable = false)
    private LocalDateTime ngayNop;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai = "CHO_DUYET";

    @PrePersist
    public void prePersist() {
        if (ngayNop == null) {
            ngayNop = LocalDateTime.now();
        }

        if (trangThai == null || trangThai.isBlank()) {
            trangThai = "CHO_DUYET";
        }
    }

    public Long getMaBaoCao() {
        return maBaoCao;
    }

    public void setMaBaoCao(Long maBaoCao) {
        this.maBaoCao = maBaoCao;
    }

    public Long getMaQuaTrinh() {
        return maQuaTrinh;
    }

    public void setMaQuaTrinh(Long maQuaTrinh) {
        this.maQuaTrinh = maQuaTrinh;
    }

    public String getTenBaoCao() {
        return tenBaoCao;
    }

    public void setTenBaoCao(String tenBaoCao) {
        this.tenBaoCao = tenBaoCao;
    }

    public String getDuongDan() {
        return duongDan;
    }

    public void setDuongDan(String duongDan) {
        this.duongDan = duongDan;
    }

    public LocalDateTime getNgayNop() {
        return ngayNop;
    }

    public void setNgayNop(LocalDateTime ngayNop) {
        this.ngayNop = ngayNop;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
