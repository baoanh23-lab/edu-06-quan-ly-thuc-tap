package edu06.edu06.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ViTriChuyenNganhId implements Serializable {

    @Column(name = "ma_vi_tri")
    private Long maViTri;

    @Column(name = "ma_chuyen_nganh")
    private String maChuyenNganh;

    public ViTriChuyenNganhId() {
    }

    public ViTriChuyenNganhId(
            Long maViTri,
            String maChuyenNganh) {
        this.maViTri = maViTri;
        this.maChuyenNganh = maChuyenNganh;
    }

    public Long getMaViTri() {
        return maViTri;
    }

    public void setMaViTri(Long maViTri) {
        this.maViTri = maViTri;
    }

    public String getMaChuyenNganh() {
        return maChuyenNganh;
    }

    public void setMaChuyenNganh(String maChuyenNganh) {
        this.maChuyenNganh = maChuyenNganh;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (!(o instanceof ViTriChuyenNganhId that)) {
            return false;
        }

        return Objects.equals(maViTri, that.maViTri)
                && Objects.equals(
                        maChuyenNganh,
                        that.maChuyenNganh);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maViTri, maChuyenNganh);
    }
}