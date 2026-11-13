package edu06.edu06.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.entity.ChuyenNganh;
import edu06.edu06.repository.ChuyenNganhRepository;

@RestController
@RequestMapping("/api/chuyen-nganh")
@CrossOrigin(origins = "http://localhost:5173")
public class ChuyenNganhController {

    private final ChuyenNganhRepository chuyenNganhRepository;

    public ChuyenNganhController(
            ChuyenNganhRepository chuyenNganhRepository) {
        this.chuyenNganhRepository = chuyenNganhRepository;
    }

    @GetMapping
    public ResponseEntity<List<ChuyenNganh>> layDanhSach() {

        return ResponseEntity.ok(
                chuyenNganhRepository
                        .findAllByOrderByTenChuyenNganhAsc());
    }
}