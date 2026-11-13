
package edu06.edu06.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu06.edu06.entity.DoiSoatDanhGia;

@Repository
public interface DoiSoatDanhGiaRepository
        extends JpaRepository<DoiSoatDanhGia, Long> {

    // Kiểm tra quá trình đã được đối soát chưa
    boolean existsByMaQuaTrinh(Long maQuaTrinh);

    // Lấy đối soát theo quá trình thực tập
    Optional<DoiSoatDanhGia> findByMaQuaTrinh(Long maQuaTrinh);

    // Lấy danh sách đối soát của giảng viên
    List<DoiSoatDanhGia> findByMaGvOrderByNgayDoiSoatDesc(
            String maGv
    );
}
