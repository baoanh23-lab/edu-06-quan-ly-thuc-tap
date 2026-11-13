package edu06.edu06.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.GiangVien;

public interface GiangVienRepository
        extends JpaRepository<GiangVien, String> {

    // Tìm giảng viên theo tài khoản đăng nhập
    Optional<GiangVien> findByIdTaiKhoan(Long idTaiKhoan);

    // Lấy danh sách giảng viên theo họ tên
    List<GiangVien> findByHoTenContainingIgnoreCase(String hoTen);
}