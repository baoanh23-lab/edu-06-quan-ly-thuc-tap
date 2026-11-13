
package edu06.edu06.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import edu06.edu06.dto.DangKyGiangVienRequest;
import edu06.edu06.entity.DangKyGiangVien;
import edu06.edu06.service.DangKyGiangVienService;

@RestController
@RequestMapping("/api/dang-ky-giang-vien")
@CrossOrigin(origins = "*")
public class DangKyGiangVienController {

    private final DangKyGiangVienService dangKyGiangVienService;

    public DangKyGiangVienController(
            DangKyGiangVienService dangKyGiangVienService) {
        this.dangKyGiangVienService = dangKyGiangVienService;
    }

    // ==========================================
    // SINH VIÊN GỬI YÊU CẦU ĐĂNG KÝ GIẢNG VIÊN
    // POST /api/dang-ky-giang-vien
    // ==========================================

    @PostMapping
    public ResponseEntity<?> dangKy(
            @RequestBody DangKyGiangVienRequest request,
            Authentication authentication) {

        try {
            DangKyGiangVien result =
                    dangKyGiangVienService.dangKy(
                            request, authentication);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Gửi yêu cầu đăng ký giảng viên thành công!",
                            "data", result
                    ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // SINH VIÊN XEM DANH SÁCH YÊU CẦU CỦA MÌNH
    // GET /api/dang-ky-giang-vien/cua-toi
    // ==========================================

    @GetMapping("/cua-toi")
    public ResponseEntity<?> layDanhSachCuaSinhVien(
            Authentication authentication) {

        try {
            List<DangKyGiangVien> result =
                    dangKyGiangVienService
                            .layDanhSachCuaSinhVien(authentication);

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // SINH VIÊN XEM GIẢNG VIÊN ĐÃ ĐƯỢC DUYỆT
    // GET /api/dang-ky-giang-vien/da-duyet
    // ==========================================

    @GetMapping("/da-duyet")
    public ResponseEntity<?> layGiangVienDaDuyet(
            Authentication authentication) {

        try {
            DangKyGiangVien result =
                    dangKyGiangVienService
                            .layGiangVienDaDuyet(authentication);

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // GIẢNG VIÊN XEM DANH SÁCH SINH VIÊN ĐĂNG KÝ MÌNH
    // GET /api/dang-ky-giang-vien/cua-giang-vien
    // ==========================================

    @GetMapping("/cua-giang-vien")
    public ResponseEntity<?> layDanhSachCuaGiangVien(
            Authentication authentication) {

        try {
            List<DangKyGiangVien> result =
                    dangKyGiangVienService
                            .layDanhSachCuaGiangVien(authentication);

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // GIẢNG VIÊN DUYỆT YÊU CẦU
    // PUT /api/dang-ky-giang-vien/{id}/duyet
    // ==========================================

    @PutMapping("/{id}/duyet")
    public ResponseEntity<?> duyetDangKy(
            @PathVariable Long id,
            Authentication authentication) {

        try {
            DangKyGiangVien result =
                    dangKyGiangVienService
                            .duyetDangKy(id, authentication);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Đã duyệt yêu cầu đăng ký giảng viên!",
                            "data", result
                    ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==========================================
    // GIẢNG VIÊN TỪ CHỐI YÊU CẦU
    // PUT /api/dang-ky-giang-vien/{id}/tu-choi
    // ==========================================

    @PutMapping("/{id}/tu-choi")
    public ResponseEntity<?> tuChoiDangKy(
            @PathVariable Long id,
            Authentication authentication) {

        try {
            DangKyGiangVien result =
                    dangKyGiangVienService
                            .tuChoiDangKy(id, authentication);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Đã từ chối yêu cầu đăng ký giảng viên!",
                            "data", result
                    ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
