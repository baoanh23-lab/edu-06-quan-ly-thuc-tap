package edu06.edu06.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.entity.GiangVien;
import edu06.edu06.repository.GiangVienRepository;

@Service
public class GiangVienService {

    private final GiangVienRepository giangVienRepository;

    public GiangVienService(GiangVienRepository giangVienRepository) {
        this.giangVienRepository = giangVienRepository;
    }

    // Lấy toàn bộ danh sách giảng viên
    @Transactional(readOnly = true)
    public List<GiangVien> getDanhSachGiangVien() {
        return giangVienRepository.findAll();
    }

    // Tìm giảng viên theo mã
    @Transactional(readOnly = true)
    public GiangVien getGiangVienByMa(String maGv) {
        return giangVienRepository.findById(maGv)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy giảng viên"));
    }
}