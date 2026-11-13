
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
@Table(name = "MinhChung")
public class MinhChung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_minh_chung")
    private Long maMinhChung;

    @Column(name = "ma_nhat_ky", nullable = false)
    private Long maNhatKy;

    @Column(name = "ten_file", nullable = false, length = 255)
    private String tenFile;

    @Column(name = "duong_dan", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String duongDan;

    @Column(name = "ngay_nop", nullable = false)
    private LocalDateTime ngayNop;

    public MinhChung() {
    }

    @PrePersist
    public void truocKhiLuu() {
        if (ngayNop == null) {
            ngayNop = LocalDateTime.now();
        }
    }

    public Long getMaMinhChung() {
        return maMinhChung;
    }

    public void setMaMinhChung(Long maMinhChung) {
        this.maMinhChung = maMinhChung;
    }

    public Long getMaNhatKy() {
        return maNhatKy;
    }

    public void setMaNhatKy(Long maNhatKy) {
        this.maNhatKy = maNhatKy;
    }

    public String getTenFile() {
        return tenFile;
    }

    public void setTenFile(String tenFile) {
        this.tenFile = tenFile;
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
}
