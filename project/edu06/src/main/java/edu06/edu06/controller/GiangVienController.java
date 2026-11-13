package edu06.edu06.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.entity.GiangVien;
import edu06.edu06.service.GiangVienService;

@RestController
@RequestMapping("/api/giang-vien")
public class GiangVienController {

    private final GiangVienService giangVienService;

    public GiangVienController(GiangVienService giangVienService) {
        this.giangVienService = giangVienService;
    }

    // Lấy danh sách giảng viên để sinh viên lựa chọn
    @GetMapping("/danh-sach")
    public ResponseEntity<List<GiangVien>> getDanhSachGiangVien() {
        return ResponseEntity.ok(
                giangVienService.getDanhSachGiangVien()
        );
    }
}