
package edu06.edu06.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import edu06.edu06.entity.ViTriThucTap;

public interface ViTriThucTapRepository
        extends JpaRepository<ViTriThucTap, Long> {

    // ===== CHỨC NĂNG SINH VIÊN =====
    @Query(value = """
        SELECT
            v.ma_vi_tri,
            v.ma_dn,
            d.ten_dn,
            d.dia_chi,
            v.ten_vi_tri,
            v.mo_ta,
            v.yeu_cau,
            v.so_luong,
            v.trang_thai
        FROM ViTriThucTap v
        INNER JOIN DoanhNghiep d
            ON v.ma_dn = d.ma_dn
        INNER JOIN ViTri_ChuyenNganh vc
            ON v.ma_vi_tri = vc.ma_vi_tri
        WHERE vc.ma_chuyen_nganh = :maChuyenNganh
          AND v.trang_thai = 'DANG_MO'
        """, nativeQuery = true)
    List<Object[]> findViTriPhuHop(
            @Param("maChuyenNganh") String maChuyenNganh
    );

    // ===== CHỨC NĂNG DOANH NGHIỆP =====

    // Lấy danh sách vị trí thuộc doanh nghiệp
    List<ViTriThucTap> findByMaDn(String maDn);

    // Tìm vị trí thuộc đúng doanh nghiệp
    Optional<ViTriThucTap> findByMaViTriAndMaDn(
            Long maViTri,
            String maDn
    );

}
