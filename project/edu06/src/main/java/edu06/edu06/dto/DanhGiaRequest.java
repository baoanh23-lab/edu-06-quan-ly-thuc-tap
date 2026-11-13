package edu06.edu06.dto;

import java.math.BigDecimal;

public class DanhGiaRequest {

    private BigDecimal diem;
    private String noiDung;

    public DanhGiaRequest() {
    }

    public BigDecimal getDiem() {
        return diem;
    }

    public void setDiem(BigDecimal diem) {
        this.diem = diem;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }
}