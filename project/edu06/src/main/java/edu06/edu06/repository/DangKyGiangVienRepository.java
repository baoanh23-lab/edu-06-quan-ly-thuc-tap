package edu06.edu06.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu06.edu06.entity.DangKyGiangVien;

@Repository
public interface DangKyGiangVienRepository
        extends JpaRepository<DangKyGiangVien, Long> {

    List<DangKyGiangVien> findByMaSv(String maSv);

    boolean existsByMaSvAndMaGv(String maSv, String maGv);

    List<DangKyGiangVien> findByMaGv(String maGv);

    List<DangKyGiangVien> findByMaGvAndTrangThai(
            String maGv, String trangThai);

    Optional<DangKyGiangVien>
            findFirstByMaSvAndTrangThaiOrderByNgayDangKyDesc(
                    String maSv, String trangThai);
}