package edu06.edu06.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.dto.ViTriThucTapDTO;
import edu06.edu06.service.DoanhNghiepViTriService;

@RestController
@RequestMapping("/api/doanh-nghiep/vi-tri")
@CrossOrigin(origins = "http://localhost:5173")
public class DoanhNghiepViTriController {

    private final DoanhNghiepViTriService viTriService;

    public DoanhNghiepViTriController(
            DoanhNghiepViTriService viTriService) {
        this.viTriService = viTriService;
    }

    // Lấy danh sách vị trí
    @GetMapping
    public ResponseEntity<?> layDanhSach(
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    viTriService.layDanhSach(authentication));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }

    // Thêm vị trí
    @PostMapping
    public ResponseEntity<?> themViTri(
            @RequestBody ViTriThucTapDTO thongTin,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    viTriService.themViTri(
                            thongTin, authentication));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }

    // Cập nhật vị trí
    @PutMapping("/{maViTri}")
    public ResponseEntity<?> capNhatViTri(
            @PathVariable Long maViTri,
            @RequestBody ViTriThucTapDTO thongTin,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    viTriService.capNhatViTri(
                            maViTri, thongTin, authentication));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }

    // Đóng hoặc mở vị trí
    @PutMapping("/{maViTri}/trang-thai")
    public ResponseEntity<?> capNhatTrangThai(
            @PathVariable Long maViTri,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    viTriService.capNhatTrangThai(
                            maViTri,
                            body.get("trangThai"),
                            authentication));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }

    // Xóa vị trí
    @DeleteMapping("/{maViTri}")
    public ResponseEntity<?> xoaViTri(
            @PathVariable Long maViTri,
            Authentication authentication) {
        try {
            viTriService.xoaViTri(maViTri, authentication);

            return ResponseEntity.ok(
                    Map.of("message", "Xóa vị trí thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }
}