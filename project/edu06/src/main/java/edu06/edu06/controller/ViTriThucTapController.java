
package edu06.edu06.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.dto.ViTriThucTapResponse;
import edu06.edu06.service.ViTriThucTapService;

@RestController
@RequestMapping("/api/vi-tri-thuc-tap")
@CrossOrigin(origins = "http://localhost:5173")
public class ViTriThucTapController {

    private final ViTriThucTapService viTriThucTapService;

    public ViTriThucTapController(
            ViTriThucTapService viTriThucTapService) {
        this.viTriThucTapService = viTriThucTapService;
    }

    // Lấy danh sách vị trí thực tập phù hợp theo chuyên ngành
    @GetMapping("/phu-hop/{maChuyenNganh}")
    public ResponseEntity<List<ViTriThucTapResponse>> layViTriPhuHop(
            @PathVariable String maChuyenNganh) {

        List<ViTriThucTapResponse> danhSach =
                viTriThucTapService.layViTriPhuHop(maChuyenNganh);

        return ResponseEntity.ok(danhSach);
    }

    // Đếm tổng số vị trí thực tập của doanh nghiệp đang đăng nhập
    @GetMapping("/doanh-nghiep/so-luong")
    public ResponseEntity<Long> demViTriDoanhNghiep(
            Authentication authentication) {

        long soLuong = viTriThucTapService.demViTriCuaDoanhNghiep(
                authentication.getName()
        );

        return ResponseEntity.ok(soLuong);
    }
}
