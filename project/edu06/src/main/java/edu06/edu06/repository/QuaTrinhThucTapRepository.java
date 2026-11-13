
package edu06.edu06.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.QuaTrinhThucTap;

public interface QuaTrinhThucTapRepository
        extends JpaRepository<QuaTrinhThucTap, Long> {

    // Tìm quá trình theo mã đơn đăng ký
    Optional<QuaTrinhThucTap> findByMaDangKy(Long maDangKy);

    // Kiểm tra đơn đã có quá trình thực tập chưa
    boolean existsByMaDangKy(Long maDangKy);

    // Lấy danh sách theo trạng thái
    List<QuaTrinhThucTap> findByTrangThai(String trangThai);
}
