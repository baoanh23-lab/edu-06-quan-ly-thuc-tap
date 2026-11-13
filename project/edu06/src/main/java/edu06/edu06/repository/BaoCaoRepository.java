
package edu06.edu06.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu06.edu06.entity.BaoCao;

@Repository
public interface BaoCaoRepository extends JpaRepository<BaoCao, Long> {

    // Lấy báo cáo theo quá trình thực tập
    List<BaoCao> findByMaQuaTrinhOrderByNgayNopDesc(Long maQuaTrinh);

    // Kiểm tra báo cáo có thuộc quá trình thực tập hay không
    boolean existsByMaBaoCaoAndMaQuaTrinh(
        Long maBaoCao,
        Long maQuaTrinh
    );
}
