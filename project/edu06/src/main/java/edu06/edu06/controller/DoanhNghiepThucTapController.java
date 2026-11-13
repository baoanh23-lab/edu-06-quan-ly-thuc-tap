package edu06.edu06.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.service.DoanhNghiepThucTapService;

@RestController
@RequestMapping("/api/doanh-nghiep/thuc-tap")
public class DoanhNghiepThucTapController {

    private final DoanhNghiepThucTapService service;

    public DoanhNghiepThucTapController(
            DoanhNghiepThucTapService service) {
        this.service = service;
    }

    // Danh sách quá trình thực tập của doanh nghiệp
    @GetMapping
    public ResponseEntity<?> danhSach(
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    service.danhSachQuaTrinh(authentication)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Chi tiết một quá trình thực tập
    @GetMapping("/{maQuaTrinh}")
    public ResponseEntity<?> chiTiet(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    service.chiTietQuaTrinh(
                            maQuaTrinh, authentication
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Danh sách nhật ký của quá trình
    @GetMapping("/{maQuaTrinh}/nhat-ky")
    public ResponseEntity<?> danhSachNhatKy(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    service.danhSachNhatKy(
                            maQuaTrinh, authentication
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}