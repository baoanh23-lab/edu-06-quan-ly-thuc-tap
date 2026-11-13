
package edu06.edu06.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.dto.DangKyThucTapRequest;
import edu06.edu06.dto.XacNhanDangKyThucTapRequest;
import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.service.DangKyThucTapService;

@RestController
@RequestMapping("/api/dang-ky-thuc-tap")
public class DangKyThucTapController {

    private final DangKyThucTapService dangKyThucTapService;

    public DangKyThucTapController(
            DangKyThucTapService dangKyThucTapService) {

        this.dangKyThucTapService = dangKyThucTapService;
    }

    // =====================================================
    // 1. SINH VIÊN ĐĂNG KÝ THỰC TẬP
    // =====================================================

    @PostMapping
    public ResponseEntity<?> dangKyThucTap(
            @RequestBody DangKyThucTapRequest request,
            Authentication authentication) {

        try {
            if (request == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Dữ liệu đăng ký không hợp lệ!")
                );
            }

            DangKyThucTap dangKy = dangKyThucTapService.dangKy(
                    request.getMaViTri(),
                    request.getNoiDung(),
                    authentication
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Đăng ký thực tập thành công!",
                            "maDangKy", dangKy.getMaDangKy(),
                            "maGv", dangKy.getMaGv(),
                            "trangThaiGv", dangKy.getTrangThaiGv(),
                            "trangThaiDn", dangKy.getTrangThaiDn(),
                            "trangThai", dangKy.getTrangThai()
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // 2. SINH VIÊN XEM DANH SÁCH ĐƠN ĐĂNG KÝ CỦA MÌNH
    // =====================================================

    @GetMapping("/cua-toi")
    public ResponseEntity<?> danhSachDangKyCuaToi(
            Authentication authentication) {

        try {
            if (authentication == null ||
                    !authentication.isAuthenticated()) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message", "Vui lòng đăng nhập!"
                        ));
            }

            return ResponseEntity.ok(
                    dangKyThucTapService.danhSachDangKyCuaToi(
                            authentication)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // 3. DOANH NGHIỆP XEM DANH SÁCH SINH VIÊN ĐĂNG KÝ
    // =====================================================

    @GetMapping("/doanh-nghiep")
    public ResponseEntity<?> danhSachDangKy(
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    dangKyThucTapService
                            .danhSachDangKyDoanhNghiep(authentication)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // 4. DOANH NGHIỆP CHẤP NHẬN SINH VIÊN
    // =====================================================

    @PutMapping("/{maDangKy}/chap-nhan")
    public ResponseEntity<?> chapNhan(
            @PathVariable Long maDangKy,
            Authentication authentication) {

        try {
            DangKyThucTap dangKy =
                    dangKyThucTapService.xuLyDangKy(
                            maDangKy,
                            true,
                            authentication
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Đã chấp nhận sinh viên!",
                            "maDangKy", dangKy.getMaDangKy(),
                            "trangThaiDn", dangKy.getTrangThaiDn(),
                            "trangThai", dangKy.getTrangThai()
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // 5. DOANH NGHIỆP TỪ CHỐI SINH VIÊN
    // =====================================================

    @PutMapping("/{maDangKy}/tu-choi")
    public ResponseEntity<?> tuChoi(
            @PathVariable Long maDangKy,
            Authentication authentication) {

        try {
            DangKyThucTap dangKy =
                    dangKyThucTapService.xuLyDangKy(
                            maDangKy,
                            false,
                            authentication
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Đã từ chối đăng ký thực tập!",
                            "maDangKy", dangKy.getMaDangKy(),
                            "trangThaiDn", dangKy.getTrangThaiDn(),
                            "trangThai", dangKy.getTrangThai()
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // 6. GIẢNG VIÊN XEM DANH SÁCH ĐƠN THỰC TẬP
    // =====================================================

    @GetMapping("/giang-vien")
    public ResponseEntity<?> danhSachDangKyGiangVien(
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    dangKyThucTapService.danhSachDangKyGiangVien(
                            authentication)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // 7. GIẢNG VIÊN CHẤP NHẬN ĐƠN THỰC TẬP
    // =====================================================

    @PutMapping("/{maDangKy}/giang-vien/chap-nhan")
    public ResponseEntity<?> giangVienChapNhan(
            @PathVariable Long maDangKy,
            @RequestBody XacNhanDangKyThucTapRequest request,
            Authentication authentication) {

        try {
            if (request == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Dữ liệu xác nhận không hợp lệ!")
                );
            }

            DangKyThucTap dangKy =
                    dangKyThucTapService.giangVienChapNhan(
                            maDangKy,
                            request,
                            authentication
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Giảng viên đã chấp nhận đơn thực tập!",
                            "maDangKy", dangKy.getMaDangKy(),
                            "trangThaiGv", dangKy.getTrangThaiGv(),
                            "trangThaiDn", dangKy.getTrangThaiDn(),
                            "trangThai", dangKy.getTrangThai()
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // 8. GIẢNG VIÊN TỪ CHỐI ĐƠN THỰC TẬP
    // =====================================================

    @PutMapping("/{maDangKy}/giang-vien/tu-choi")
    public ResponseEntity<?> giangVienTuChoi(
            @PathVariable Long maDangKy,
            Authentication authentication) {

        try {
            DangKyThucTap dangKy =
                    dangKyThucTapService.giangVienTuChoi(
                            maDangKy,
                            authentication
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Giảng viên đã từ chối đơn thực tập!",
                            "maDangKy", dangKy.getMaDangKy(),
                            "trangThaiGv", dangKy.getTrangThaiGv(),
                            "trangThaiDn", dangKy.getTrangThaiDn(),
                            "trangThai", dangKy.getTrangThai()
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}
