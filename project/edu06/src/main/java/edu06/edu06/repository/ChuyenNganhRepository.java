package edu06.edu06.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu06.edu06.entity.ChuyenNganh;

public interface ChuyenNganhRepository
        extends JpaRepository<ChuyenNganh, String> {

    List<ChuyenNganh> findAllByOrderByTenChuyenNganhAsc();
}