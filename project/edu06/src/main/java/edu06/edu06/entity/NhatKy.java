
package edu06.edu06.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "NhatKy")
public class NhatKy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_nhat_ky")
    private Long maNhatKy;

    @Column(name = "ma_qua_trinh", nullable = false)
    private Long maQuaTrinh;

    @Column(name = "ngay", nullable = false)
    private LocalDate ngay;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String noiDung;

    public NhatKy() {
    }

    public Long getMaNhatKy() {
        return maNhatKy;
    }

    public void setMaNhatKy(Long maNhatKy) {
        this.maNhatKy = maNhatKy;
    }

    public Long getMaQuaTrinh() {
        return maQuaTrinh;
    }

    public void setMaQuaTrinh(Long maQuaTrinh) {
        this.maQuaTrinh = maQuaTrinh;
    }

    public LocalDate getNgay() {
        return ngay;
    }

    public void setNgay(LocalDate ngay) {
        this.ngay = ngay;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }
}
