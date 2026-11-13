package edu06.edu06.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.DangKyThucTap;

public interface DangKyThucTapRepository
        extends JpaRepository<DangKyThucTap, Long> {

    // Kiểm tra sinh viên đã đăng ký vị trí này chưa
    boolean existsByMaSvAndMaViTri(String maSv, Long maViTri);

    // Kiểm tra vị trí đã có sinh viên đăng ký chưa
    boolean existsByMaViTri(Long maViTri);

    // Lấy danh sách đăng ký của một sinh viên
    List<DangKyThucTap> findByMaSv(String maSv);

    // Lấy danh sách đăng ký gửi đến giảng viên
    List<DangKyThucTap> findByMaGv(String maGv);

    // Lấy danh sách đăng ký theo trạng thái giảng viên
    List<DangKyThucTap> findByMaGvAndTrangThaiGv(
            String maGv, String trangThaiGv);

    // Tìm đăng ký theo sinh viên và giảng viên
    List<DangKyThucTap> findByMaSvAndMaGv(
            String maSv, String maGv);

    // Lấy đăng ký thuộc danh sách vị trí của doanh nghiệp
    List<DangKyThucTap> findByMaViTriIn(List<Long> maViTris);

    List<DangKyThucTap> findByMaSvOrderByNgayDangKyDesc(String maSv);

    // Đếm số sinh viên đã được doanh nghiệp chấp nhận
    long countByMaViTriAndTrangThaiDn(
            Long maViTri, String trangThaiDn);
}