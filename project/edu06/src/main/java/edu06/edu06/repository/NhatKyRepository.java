
package edu06.edu06.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu06.edu06.entity.NhatKy;

@Repository
public interface NhatKyRepository extends JpaRepository<NhatKy, Long> {

    List<NhatKy> findByMaQuaTrinhOrderByNgayDesc(Long maQuaTrinh);

    List<NhatKy> findByMaQuaTrinh(Long maQuaTrinh);

}
