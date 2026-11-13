package edu06.edu06.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.DanhGia;

public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {

    Optional<DanhGia> findByMaQuaTrinhAndLoaiDanhGia(
            Long maQuaTrinh, String loaiDanhGia);

    boolean existsByMaQuaTrinhAndLoaiDanhGia(
            Long maQuaTrinh, String loaiDanhGia);

    List<DanhGia> findByMaGvAndLoaiDanhGiaOrderByNgayDanhGiaDesc(
            String maGv, String loaiDanhGia);
}