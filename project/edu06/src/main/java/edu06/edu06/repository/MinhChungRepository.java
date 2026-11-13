
package edu06.edu06.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu06.edu06.entity.MinhChung;

@Repository
public interface MinhChungRepository extends JpaRepository<MinhChung, Long> {

    List<MinhChung> findByMaNhatKyOrderByNgayNopDesc(Long maNhatKy);
}
