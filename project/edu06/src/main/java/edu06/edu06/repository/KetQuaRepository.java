
package edu06.edu06.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu06.edu06.entity.KetQua;

@Repository
public interface KetQuaRepository extends JpaRepository<KetQua, Long> {

    Optional<KetQua> findByMaQuaTrinh(Long maQuaTrinh);

    boolean existsByMaQuaTrinh(Long maQuaTrinh);

    List<KetQua> findByMaGvOrderByNgayXacNhanDesc(String maGv);
}
