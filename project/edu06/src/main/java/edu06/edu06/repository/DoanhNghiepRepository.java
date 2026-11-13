
package edu06.edu06.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu06.edu06.entity.DoanhNghiep;

@Repository
public interface DoanhNghiepRepository
        extends JpaRepository<DoanhNghiep, String> {

    Optional<DoanhNghiep> findByIdTaiKhoan(Long idTaiKhoan);
}
