
package edu06.edu06.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.entity.KetQua;
import edu06.edu06.service.KetQuaService;

@RestController
@RequestMapping("/api/ket-qua")
@CrossOrigin(origins = "*")
public class KetQuaController {

    private final KetQuaService ketQuaService;

    public KetQuaController(KetQuaService ketQuaService) {
        this.ketQuaService = ketQuaService;
    }

    // Danh sách sinh viên đủ điều kiện xác nhận kết quả
    @GetMapping("/giang-vien")
    public ResponseEntity<?> getDanhSach(
            Authentication authentication) {

        return ResponseEntity.ok(
                ketQuaService.getDanhSach(authentication)
        );
    }

    // Chi tiết đánh giá, đối soát và báo cáo của sinh viên
    @GetMapping("/qua-trinh/{maQuaTrinh}")
    public ResponseEntity<?> getChiTiet(
            @PathVariable Long maQuaTrinh,
            Authentication authentication) {

        return ResponseEntity.ok(
                ketQuaService.getChiTiet(
                        maQuaTrinh,
                        authentication
                )
        );
    }

    // Giảng viên xác nhận kết quả cuối cùng
    @PostMapping("/qua-trinh/{maQuaTrinh}/xac-nhan")
    public ResponseEntity<KetQua> xacNhan(
            @PathVariable Long maQuaTrinh,
            @RequestBody XacNhanRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                ketQuaService.xacNhan(
                        maQuaTrinh,
                        request.ketQua(),
                        authentication
                )
        );
    }
        // Sinh viên xem danh sách kết quả thực tập của mình
        @GetMapping("/sinh-vien")
        public ResponseEntity<?> getKetQuaSinhVien(
                Authentication authentication) {

        return ResponseEntity.ok(
                ketQuaService.getKetQuaSinhVien(authentication)
        );
        }

        // Sinh viên xem chi tiết kết quả của một quá trình
        @GetMapping("/sinh-vien/qua-trinh/{maQuaTrinh}")
        public ResponseEntity<?> getChiTietSinhVien(
                @PathVariable Long maQuaTrinh,
                Authentication authentication) {

        return ResponseEntity.ok(
                ketQuaService.getChiTietSinhVien(
                        maQuaTrinh,
                        authentication
                )
        );
        }

    public record XacNhanRequest(
            String ketQua
    ) {}
}
