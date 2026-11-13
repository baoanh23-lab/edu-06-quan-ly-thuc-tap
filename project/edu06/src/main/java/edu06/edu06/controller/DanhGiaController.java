
package edu06.edu06.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.dto.DanhGiaRequest;
import edu06.edu06.dto.DanhGiaResponse;
import edu06.edu06.service.DanhGiaService;

@RestController
@RequestMapping("/api/danh-gia")
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    public DanhGiaController(DanhGiaService danhGiaService) {
        this.danhGiaService = danhGiaService;
    }

    // =========================
    // GIẢNG VIÊN
    // =========================

    @GetMapping("/giang-vien")
    public ResponseEntity<List<DanhGiaResponse>> layDanhSach(
            Authentication authentication) {

        return ResponseEntity.ok(
                danhGiaService.layDanhSachDanhGia(
                        authentication.getName()));
    }

    @GetMapping("/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<DanhGiaResponse> xemDanhGia(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        return ResponseEntity.ok(
                danhGiaService.xemDanhGia(
                        maQuaTrinh,
                        authentication.getName()));
    }

    @PostMapping("/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<DanhGiaResponse> taoDanhGia(
            @PathVariable Long maQuaTrinh,
            @RequestBody DanhGiaRequest request,
            Authentication authentication) {

        DanhGiaResponse response = danhGiaService.taoDanhGia(
                maQuaTrinh,
                request,
                authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================
    // DOANH NGHIỆP
    // =========================

    // Danh sách sinh viên thuộc doanh nghiệp đang đăng nhập
    @GetMapping("/doanh-nghiep")
    public ResponseEntity<List<DanhGiaResponse>> layDanhSachDoanhNghiep(
            Authentication authentication) {

        return ResponseEntity.ok(
                danhGiaService.layDanhSachDanhGiaDoanhNghiep(
                        authentication.getName()));
    }

    // Xem đánh giá của doanh nghiệp đối với một sinh viên
    @GetMapping("/doanh-nghiep/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<DanhGiaResponse> xemDanhGiaDoanhNghiep(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        return ResponseEntity.ok(
                danhGiaService.xemDanhGiaDoanhNghiep(
                        maQuaTrinh,
                        authentication.getName()));
    }

    // Doanh nghiệp gửi đánh giá sinh viên
    @PostMapping("/doanh-nghiep/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<DanhGiaResponse> taoDanhGiaDoanhNghiep(
            @PathVariable Long maQuaTrinh,
            @RequestBody DanhGiaRequest request,
            Authentication authentication) {

        DanhGiaResponse response =
                danhGiaService.taoDanhGiaDoanhNghiep(
                        maQuaTrinh,
                        request,
                        authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
