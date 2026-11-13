
package edu06.edu06.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.entity.DoiSoatDanhGia;
import edu06.edu06.service.DoiSoatDanhGiaService;

@RestController
@RequestMapping("/api/doi-soat-danh-gia")
@CrossOrigin(origins = "*")
public class DoiSoatDanhGiaController {

    private final DoiSoatDanhGiaService doiSoatService;

    public DoiSoatDanhGiaController(
            DoiSoatDanhGiaService doiSoatService) {
        this.doiSoatService = doiSoatService;
    }

    // Danh sách quá trình đủ điều kiện đối soát
    @GetMapping("/giang-vien")
    public Object getDanhSach(Authentication authentication) {
        return doiSoatService.getDanhSach(authentication);
    }

    // Chi tiết đánh giá của hai bên
    @GetMapping("/qua-trinh/{maQuaTrinh}")
    public Object getChiTiet(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        return doiSoatService.getChiTiet(
                maQuaTrinh,
                authentication
        );
    }

    // Gửi kết quả đối soát
    @PostMapping("/qua-trinh/{maQuaTrinh}")
    public DoiSoatDanhGia taoDoiSoat(
            @PathVariable Long maQuaTrinh,
            @RequestBody DoiSoatRequest request,
            Authentication authentication) {

        return doiSoatService.taoDoiSoat(
                maQuaTrinh,
                request.ketQua(),
                request.nhanXet(),
                authentication
        );
    }

    public record DoiSoatRequest(
            String ketQua,
            String nhanXet
    ) {}
}
