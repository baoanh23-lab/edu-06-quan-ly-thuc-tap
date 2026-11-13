
package edu06.edu06.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.TaiKhoan;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {

    Optional<TaiKhoan> findByUsername(String username);
}