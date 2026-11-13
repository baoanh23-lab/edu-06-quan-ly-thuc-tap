package edu06.edu06.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.entity.SinhVien;
import edu06.edu06.service.SinhVienService;

@RestController
@RequestMapping("/api/sinh-vien")
public class SinhVienController {

    private final SinhVienService sinhVienService;

    public SinhVienController(SinhVienService sinhVienService) {
        this.sinhVienService = sinhVienService;
    }

    // Lấy danh sách sinh viên
    @GetMapping
    public List<SinhVien> layDanhSachSinhVien() {
        return sinhVienService.layDanhSachSinhVien();
    }

    // Lấy hồ sơ của sinh viên đang đăng nhập
    @GetMapping("/ho-so")
    public ResponseEntity<SinhVien> layHoSoSinhVien(
            Authentication authentication) {

        String username = authentication.getName();

        SinhVien sinhVien =
                sinhVienService.layHoSoSinhVien(username);

        return ResponseEntity.ok(sinhVien);
    }
}