
package edu06.edu06.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.service.QuaTrinhThucTapService;

@RestController
@RequestMapping("/api/qua-trinh-thuc-tap")
public class QuaTrinhThucTapController {

    private final QuaTrinhThucTapService quaTrinhService;

    public QuaTrinhThucTapController(
            QuaTrinhThucTapService quaTrinhService) {
        this.quaTrinhService = quaTrinhService;
    }

    // Sinh viên xem quá trình thực tập của mình
    @GetMapping("/cua-toi")
    public ResponseEntity<?> danhSachCuaSinhVien(
            Authentication authentication) {

        List<Map<String, Object>> ketQua =
                quaTrinhService.danhSachCuaSinhVien(authentication);

        return ResponseEntity.ok(ketQua);
    }

    // Giảng viên xem quá trình thực tập được phân công
    @GetMapping("/giang-vien")
    public ResponseEntity<?> danhSachCuaGiangVien(
            Authentication authentication) {

        List<Map<String, Object>> ketQua =
                quaTrinhService.danhSachCuaGiangVien(authentication);

        return ResponseEntity.ok(ketQua);
    }

    // Doanh nghiệp xem quá trình thực tập thuộc doanh nghiệp mình
    @GetMapping("/doanh-nghiep")
    public ResponseEntity<?> danhSachCuaDoanhNghiep(
            Authentication authentication) {

        List<Map<String, Object>> ketQua =
                quaTrinhService.danhSachCuaDoanhNghiep(authentication);

        return ResponseEntity.ok(ketQua);
    }
}
