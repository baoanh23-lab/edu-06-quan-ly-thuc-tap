package edu06.edu06.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "ViTri_ChuyenNganh")
public class ViTriChuyenNganh {

    @EmbeddedId
    private ViTriChuyenNganhId id;

    public ViTriChuyenNganh() {
    }

    public ViTriChuyenNganh(
            Long maViTri,
            String maChuyenNganh) {

        this.id = new ViTriChuyenNganhId(
                maViTri,
                maChuyenNganh);
    }

    public ViTriChuyenNganhId getId() {
        return id;
    }

    public void setId(ViTriChuyenNganhId id) {
        this.id = id;
    }
}