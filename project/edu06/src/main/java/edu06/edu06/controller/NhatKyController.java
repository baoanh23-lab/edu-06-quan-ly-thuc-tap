package edu06.edu06.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.dto.NhatKyRequest;
import edu06.edu06.entity.NhatKy;
import edu06.edu06.service.NhatKyService;

@RestController
@RequestMapping("/api/nhat-ky")
public class NhatKyController {

    private final NhatKyService nhatKyService;

    public NhatKyController(NhatKyService nhatKyService) {
        this.nhatKyService = nhatKyService;
    }

    // Sinh viên xem nhật ký của mình
    @GetMapping("/cua-toi")
    public ResponseEntity<?> danhSachCuaToi(
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    nhatKyService.danhSachCuaToi(authentication)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Sinh viên xem nhật ký theo quá trình
    @GetMapping("/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<?> danhSachTheoQuaTrinh(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    nhatKyService.danhSachTheoQuaTrinh(
                            maQuaTrinh, authentication
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Giảng viên xem nhật ký theo quá trình được phân công
    @GetMapping("/giang-vien/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<?> danhSachCuaGiangVien(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    nhatKyService.danhSachTheoQuaTrinhCuaGiangVien(
                            maQuaTrinh, authentication
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Sinh viên tạo nhật ký
    @PostMapping("/{maQuaTrinh}")
    public ResponseEntity<?> taoNhatKy(
            @PathVariable Long maQuaTrinh,
            @RequestBody NhatKyRequest request,
            Authentication authentication) {

        try {
            NhatKy nhatKy = nhatKyService.taoNhatKy(
                    maQuaTrinh, request, authentication
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Tạo nhật ký thực tập thành công!",
                            "maNhatKy", nhatKy.getMaNhatKy(),
                            "maQuaTrinh", nhatKy.getMaQuaTrinh(),
                            "ngay", nhatKy.getNgay(),
                            "noiDung", nhatKy.getNoiDung()
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Sinh viên cập nhật nhật ký
    @PutMapping("/{maNhatKy}")
    public ResponseEntity<?> capNhatNhatKy(
            @PathVariable Long maNhatKy,
            @RequestBody NhatKyRequest request,
            Authentication authentication) {

        try {
            NhatKy nhatKy = nhatKyService.capNhatNhatKy(
                    maNhatKy, request, authentication
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Cập nhật nhật ký thành công!",
                            "maNhatKy", nhatKy.getMaNhatKy(),
                            "ngay", nhatKy.getNgay(),
                            "noiDung", nhatKy.getNoiDung()
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Sinh viên xóa nhật ký
    @DeleteMapping("/{maNhatKy}")
    public ResponseEntity<?> xoaNhatKy(
            @PathVariable Long maNhatKy,
            Authentication authentication) {

        try {
            nhatKyService.xoaNhatKy(maNhatKy, authentication);

            return ResponseEntity.ok(
                    Map.of("message", "Xóa nhật ký thành công!")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}