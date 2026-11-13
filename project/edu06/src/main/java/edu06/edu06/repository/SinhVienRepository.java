package edu06.edu06.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.SinhVien;

public interface SinhVienRepository
        extends JpaRepository<SinhVien, String> {
        Optional<SinhVien> findByIdTaiKhoan(long idTaiKhoan);
}