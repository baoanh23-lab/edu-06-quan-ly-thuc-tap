
package edu06.edu06.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu06.edu06.entity.BaoCao;
import edu06.edu06.service.BaoCaoService;

@RestController
@RequestMapping("/api/bao-cao")
public class BaoCaoController {

    private final BaoCaoService baoCaoService;

    public BaoCaoController(BaoCaoService baoCaoService) {
        this.baoCaoService = baoCaoService;
    }

    // Sinh viên nộp báo cáo thực tập
    @PostMapping("/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<?> taoBaoCao(
            @PathVariable Long maQuaTrinh,
            @RequestParam("tenBaoCao") String tenBaoCao,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        BaoCao baoCao = baoCaoService.taoBaoCao(
                maQuaTrinh,
                tenBaoCao,
                file,
                authentication
        );

        return ResponseEntity.ok(Map.of(
                "message", "Nộp báo cáo thực tập thành công!",
                "maBaoCao", baoCao.getMaBaoCao(),
                "maQuaTrinh", baoCao.getMaQuaTrinh(),
                "tenBaoCao", baoCao.getTenBaoCao(),
                "ngayNop", baoCao.getNgayNop(),
                "trangThai", baoCao.getTrangThai()
        ));
    }

    // Xem danh sách báo cáo theo quá trình thực tập
    @GetMapping("/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<List<Map<String, Object>>> danhSachTheoQuaTrinh(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        return ResponseEntity.ok(
                baoCaoService.danhSachTheoQuaTrinh(
                        maQuaTrinh,
                        authentication
                )
        );
    }

    // Xem chi tiết báo cáo
    @GetMapping("/{maBaoCao}")
    public ResponseEntity<Map<String, Object>> chiTiet(
            @PathVariable Long maBaoCao,
            Authentication authentication) {

        return ResponseEntity.ok(
                baoCaoService.chiTiet(
                        maBaoCao,
                        authentication
                )
        );
    }

    // Tải file báo cáo
    @GetMapping("/{maBaoCao}/tai-xuong")
        public ResponseEntity<Resource> taiFile(
                @PathVariable Long maBaoCao,
                Authentication authentication) {

        Resource resource = baoCaoService.taiFile(
                maBaoCao,
                authentication
        );

        String tenFile = resource.getFilename();

        if (tenFile == null || tenFile.isBlank()) {
                tenFile = "bao-cao";
        }

        String duoiFile = org.springframework.util.StringUtils
                .getFilenameExtension(tenFile);

        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;

        if (duoiFile != null) {
                switch (duoiFile.toLowerCase()) {
                case "doc":
                        contentType = MediaType.parseMediaType(
                                "application/msword"
                        );
                        break;

                case "docx":
                        contentType = MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        );
                        break;

                case "pdf":
                        contentType = MediaType.APPLICATION_PDF;
                        break;

                default:
                        break;
                }
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(
                                        tenFile,
                                        java.nio.charset.StandardCharsets.UTF_8
                                )
                                .build()
                                .toString()
                )
                .body(resource);
        }

    // Xóa báo cáo
    @DeleteMapping("/{maBaoCao}")
    public ResponseEntity<?> xoaBaoCao(
            @PathVariable Long maBaoCao,
            Authentication authentication) {

        baoCaoService.xoaBaoCao(
                maBaoCao,
                authentication
        );

        return ResponseEntity.ok(Map.of(
                "message", "Xóa báo cáo thực tập thành công!"
        ));
    }
        // ==========================================
    // GIẢNG VIÊN DUYỆT BÁO CÁO
    // ==========================================

    @PutMapping("/{maBaoCao}/duyet")
    public ResponseEntity<?> duyetBaoCao(
            @PathVariable Long maBaoCao,
            Authentication authentication) {

        return ResponseEntity.ok(
                baoCaoService.duyetBaoCao(
                        maBaoCao,
                        authentication
                )
        );
    }

    // ==========================================
    // GIẢNG VIÊN TỪ CHỐI BÁO CÁO
    // ==========================================

    @PutMapping("/{maBaoCao}/tu-choi")
    public ResponseEntity<?> tuChoiBaoCao(
            @PathVariable Long maBaoCao,
            Authentication authentication) {

        return ResponseEntity.ok(
                baoCaoService.tuChoiBaoCao(
                        maBaoCao,
                        authentication
                )
        );
    }
}
