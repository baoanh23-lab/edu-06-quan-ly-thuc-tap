package edu06.edu06.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;

@Service
public class SinhVienService {

    private final SinhVienRepository sinhVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    public SinhVienService(
            SinhVienRepository sinhVienRepository,
            TaiKhoanRepository taiKhoanRepository) {
        this.sinhVienRepository = sinhVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    // Lấy danh sách sinh viên
    public List<SinhVien> layDanhSachSinhVien() {
        return sinhVienRepository.findAll();
    }
    
    // Lấy hồ sơ sinh viên đang đăng nhập
    public SinhVien layHoSoSinhVien(String username) {

        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản"));

        return sinhVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ sinh viên"));
    }
}