package edu06.edu06.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.ViTriChuyenNganh;
import edu06.edu06.entity.ViTriChuyenNganhId;

public interface ViTriChuyenNganhRepository
        extends JpaRepository<
                ViTriChuyenNganh,
                ViTriChuyenNganhId> {

    // Lấy danh sách chuyên ngành của một vị trí
    List<ViTriChuyenNganh>
        findByIdMaViTri(Long maViTri);

    // Xóa toàn bộ chuyên ngành của một vị trí
    void deleteByIdMaViTri(Long maViTri);
}