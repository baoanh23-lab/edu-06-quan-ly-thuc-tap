
package edu06.edu06.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.dto.DangKyGiangVienRequest;
import edu06.edu06.entity.DangKyGiangVien;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.repository.DangKyGiangVienRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;

@Service
public class DangKyGiangVienService {

    private final DangKyGiangVienRepository dangKyGiangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final GiangVienRepository giangVienRepository;

    public DangKyGiangVienService(
            DangKyGiangVienRepository dangKyGiangVienRepository,
            SinhVienRepository sinhVienRepository,
            TaiKhoanRepository taiKhoanRepository,
            GiangVienRepository giangVienRepository) {

        this.dangKyGiangVienRepository = dangKyGiangVienRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.giangVienRepository = giangVienRepository;
    }

    // ==========================================
    // LẤY TÀI KHOẢN ĐANG ĐĂNG NHẬP
    // ==========================================

    private TaiKhoan layTaiKhoanHienTai(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        return taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy tài khoản!"));
    }

    // ==========================================
    // LẤY SINH VIÊN HIỆN TẠI
    // ==========================================

    private SinhVien laySinhVienHienTai(
            Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanHienTai(authentication);

        return sinhVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy thông tin sinh viên!"));
    }

    // ==========================================
    // LẤY GIẢNG VIÊN HIỆN TẠI
    // ==========================================

    private GiangVien layGiangVienHienTai(
            Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanHienTai(authentication);

        return giangVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy thông tin giảng viên!"));
    }

    // ==========================================
    // SINH VIÊN ĐĂNG KÝ GIẢNG VIÊN
    // ==========================================

    @Transactional
    public DangKyGiangVien dangKy(
            DangKyGiangVienRequest request,
            Authentication authentication) {

        SinhVien sinhVien = laySinhVienHienTai(authentication);

        if (request == null
                || request.getMaGv() == null
                || request.getMaGv().trim().isEmpty()) {

            throw new RuntimeException("Vui lòng chọn giảng viên!");
        }

        String maGv = request.getMaGv().trim();

        if (!giangVienRepository.existsById(maGv)) {
            throw new RuntimeException("Giảng viên không tồn tại!");
        }

        if (dangKyGiangVienRepository.existsByMaSvAndMaGv(
                sinhVien.getMaSv(), maGv)) {

            throw new RuntimeException(
                    "Bạn đã gửi yêu cầu đến giảng viên này rồi!");
        }

        DangKyGiangVien dangKy = new DangKyGiangVien();

        dangKy.setMaSv(sinhVien.getMaSv());
        dangKy.setMaGv(maGv);
        dangKy.setNgayDangKy(LocalDate.now());

        dangKy.setNoiDung(
                request.getNoiDung() == null
                        ? ""
                        : request.getNoiDung().trim());

        dangKy.setTrangThai("CHO_DUYET");

        return dangKyGiangVienRepository.save(dangKy);
    }

    // ==========================================
    // SINH VIÊN XEM DANH SÁCH YÊU CẦU CỦA MÌNH
    // ==========================================

    public List<DangKyGiangVien> layDanhSachCuaSinhVien(
            Authentication authentication) {

        SinhVien sinhVien = laySinhVienHienTai(authentication);

        return dangKyGiangVienRepository.findByMaSv(
                sinhVien.getMaSv());
    }

    // ==========================================
    // SINH VIÊN XEM GIẢNG VIÊN ĐÃ DUYỆT
    // ==========================================

    public DangKyGiangVien layGiangVienDaDuyet(
            Authentication authentication) {

        SinhVien sinhVien = laySinhVienHienTai(authentication);

        return dangKyGiangVienRepository
                .findFirstByMaSvAndTrangThaiOrderByNgayDangKyDesc(
                        sinhVien.getMaSv(), "DA_DUYET")
                .orElseThrow(() -> new RuntimeException(
                        "Bạn chưa có giảng viên hướng dẫn được duyệt!"));
    }

    // ==========================================
    // GIẢNG VIÊN XEM DANH SÁCH SINH VIÊN ĐĂNG KÝ MÌNH
    // ==========================================

    public List<DangKyGiangVien> layDanhSachCuaGiangVien(
            Authentication authentication) {

        GiangVien giangVien = layGiangVienHienTai(authentication);

        return dangKyGiangVienRepository.findByMaGv(
                giangVien.getMaGv());
    }

    // ==========================================
    // GIẢNG VIÊN DUYỆT YÊU CẦU
    // ==========================================

    @Transactional
    public DangKyGiangVien duyetDangKy(
            Long maDangKyGv,
            Authentication authentication) {

        GiangVien giangVien = layGiangVienHienTai(authentication);

        DangKyGiangVien dangKy = dangKyGiangVienRepository
                .findById(maDangKyGv)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy yêu cầu đăng ký giảng viên!"));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new RuntimeException(
                    "Bạn không có quyền duyệt yêu cầu này!");
        }

        if (!"CHO_DUYET".equals(dangKy.getTrangThai())) {
            throw new RuntimeException(
                    "Yêu cầu này đã được xử lý trước đó!");
        }

        dangKy.setTrangThai("DA_DUYET");

        return dangKyGiangVienRepository.save(dangKy);
    }

    // ==========================================
    // GIẢNG VIÊN TỪ CHỐI YÊU CẦU
    // ==========================================

    @Transactional
    public DangKyGiangVien tuChoiDangKy(
            Long maDangKyGv,
            Authentication authentication) {

        GiangVien giangVien = layGiangVienHienTai(authentication);

        DangKyGiangVien dangKy = dangKyGiangVienRepository
                .findById(maDangKyGv)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy yêu cầu đăng ký giảng viên!"));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new RuntimeException(
                    "Bạn không có quyền từ chối yêu cầu này!");
        }

        if (!"CHO_DUYET".equals(dangKy.getTrangThai())) {
            throw new RuntimeException(
                    "Yêu cầu này đã được xử lý trước đó!");
        }

        dangKy.setTrangThai("TU_CHOI");

        return dangKyGiangVienRepository.save(dangKy);
    }
}
