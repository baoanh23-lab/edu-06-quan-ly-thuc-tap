
package edu06.edu06.dto;

import java.time.LocalDate;

public class NhatKyRequest {

    private LocalDate ngay;
    private String noiDung;

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
