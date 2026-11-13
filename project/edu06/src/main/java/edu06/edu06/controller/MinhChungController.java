
package edu06.edu06.controller;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu06.edu06.entity.MinhChung;
import edu06.edu06.service.MinhChungService;

@RestController
@RequestMapping("/api/minh-chung")
public class MinhChungController {

    private final MinhChungService minhChungService;

    public MinhChungController(MinhChungService minhChungService) {
        this.minhChungService = minhChungService;
    }

    // =====================================================
    // SINH VIÊN TẢI MINH CHỨNG LÊN NHẬT KÝ
    // =====================================================

    @PostMapping("/nhat-ky/{maNhatKy}")
    public ResponseEntity<?> taoMinhChung(
            @PathVariable Long maNhatKy,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        try {
            MinhChung minhChung = minhChungService.taoMinhChung(
                    maNhatKy, file, authentication
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Tải minh chứng thành công!",
                    "maMinhChung", minhChung.getMaMinhChung(),
                    "maNhatKy", minhChung.getMaNhatKy(),
                    "tenFile", minhChung.getTenFile(),
                    "ngayNop", minhChung.getNgayNop()
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // SINH VIÊN XEM MINH CHỨNG THEO NHẬT KÝ
    // =====================================================

    @GetMapping("/nhat-ky/{maNhatKy}")
    public ResponseEntity<?> danhSachTheoNhatKy(
            @PathVariable Long maNhatKy,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    minhChungService.danhSachTheoNhatKy(
                            maNhatKy, authentication
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // GIẢNG VIÊN XEM MINH CHỨNG THEO NHẬT KÝ
    // =====================================================

    @GetMapping("/giang-vien/nhat-ky/{maNhatKy}")
    public ResponseEntity<?> danhSachTheoNhatKyCuaGiangVien(
            @PathVariable Long maNhatKy,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    minhChungService.danhSachTheoNhatKyCuaGiangVien(
                            maNhatKy, authentication
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // DOANH NGHIỆP XEM MINH CHỨNG THEO NHẬT KÝ
    // =====================================================

    @GetMapping("/doanh-nghiep/nhat-ky/{maNhatKy}")
    public ResponseEntity<?> danhSachTheoNhatKyCuaDoanhNghiep(
            @PathVariable Long maNhatKy,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    minhChungService.danhSachTheoNhatKyCuaDoanhNghiep(
                            maNhatKy, authentication
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // SINH VIÊN XEM THÔNG TIN MINH CHỨNG
    // =====================================================

    @GetMapping("/{maMinhChung}")
    public ResponseEntity<?> chiTiet(
            @PathVariable Long maMinhChung,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    minhChungService.chiTiet(
                            maMinhChung, authentication
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // SINH VIÊN TẢI FILE MINH CHỨNG
    // =====================================================

    @GetMapping("/{maMinhChung}/tai-xuong")
    public ResponseEntity<?> taiFile(
            @PathVariable Long maMinhChung,
            Authentication authentication) {

        try {
            return taoPhanHoiTaiFile(
                    minhChungService.chiTiet(
                            maMinhChung, authentication
                    ),
                    minhChungService.taiFile(
                            maMinhChung, authentication
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // GIẢNG VIÊN TẢI FILE MINH CHỨNG
    // =====================================================

    @GetMapping("/giang-vien/{maMinhChung}/tai-xuong")
    public ResponseEntity<?> taiFileCuaGiangVien(
            @PathVariable Long maMinhChung,
            Authentication authentication) {

        try {
            return taoPhanHoiTaiFile(
                    minhChungService.chiTietCuaGiangVien(
                            maMinhChung, authentication
                    ),
                    minhChungService.taiFileCuaGiangVien(
                            maMinhChung, authentication
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // DOANH NGHIỆP TẢI FILE MINH CHỨNG
    // =====================================================

    @GetMapping("/doanh-nghiep/{maMinhChung}/tai-xuong")
    public ResponseEntity<?> taiFileCuaDoanhNghiep(
            @PathVariable Long maMinhChung,
            Authentication authentication) {

        try {
            return taoPhanHoiTaiFile(
                    minhChungService.chiTietCuaDoanhNghiep(
                            maMinhChung, authentication
                    ),
                    minhChungService.taiFileCuaDoanhNghiep(
                            maMinhChung, authentication
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =====================================================
    // TẠO PHẢN HỒI FILE DÙNG CHUNG
    // =====================================================

    private ResponseEntity<Resource> taoPhanHoiTaiFile(
            Map<String, Object> thongTin,
            Resource resource) {

        String tenFile = String.valueOf(
                thongTin.get("tenFile")
        );

        ContentDisposition contentDisposition =
                ContentDisposition.attachment()
                        .filename(tenFile, StandardCharsets.UTF_8)
                        .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString()
                )
                .body(resource);
    }

    // =====================================================
    // SINH VIÊN XÓA MINH CHỨNG
    // =====================================================

    @DeleteMapping("/{maMinhChung}")
    public ResponseEntity<?> xoaMinhChung(
            @PathVariable Long maMinhChung,
            Authentication authentication) {

        try {
            minhChungService.xoaMinhChung(
                    maMinhChung, authentication
            );

            return ResponseEntity.ok(
                    Map.of("message", "Xóa minh chứng thành công!")
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}
