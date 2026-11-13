package edu06.edu06.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.dto.NhatKyRequest;
import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.NhatKy;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.NhatKyRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;

@Service
public class NhatKyService {

    private final NhatKyRepository nhatKyRepository;
    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;

    public NhatKyService(
            NhatKyRepository nhatKyRepository,
            QuaTrinhThucTapRepository quaTrinhRepository,
            DangKyThucTapRepository dangKyRepository,
            TaiKhoanRepository taiKhoanRepository,
            SinhVienRepository sinhVienRepository,
            GiangVienRepository giangVienRepository) {

        this.nhatKyRepository = nhatKyRepository;
        this.quaTrinhRepository = quaTrinhRepository;
        this.dangKyRepository = dangKyRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.giangVienRepository = giangVienRepository;
    }

    // Lấy tài khoản đang đăng nhập
    private TaiKhoan layTaiKhoanDangNhap(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Vui lòng đăng nhập!");
        }

        return taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));
    }

    // Lấy sinh viên đang đăng nhập
    private SinhVien laySinhVienDangNhap(Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanDangNhap(authentication);

        return sinhVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy thông tin sinh viên!"));
    }

    // Lấy giảng viên đang đăng nhập
    private GiangVien layGiangVienDangNhap(Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanDangNhap(authentication);

        return giangVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ giảng viên!"));
    }

    // Kiểm tra quyền sinh viên
    private QuaTrinhThucTap kiemTraQuyenTruyCap(
            Long maQuaTrinh,
            Authentication authentication) {

        SinhVien sinhVien = laySinhVienDangNhap(authentication);

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy quá trình thực tập!"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đơn đăng ký thực tập!"));

        if (!sinhVien.getMaSv().equals(dangKy.getMaSv())) {
            throw new RuntimeException(
                    "Bạn không có quyền truy cập quá trình thực tập này!");
        }

        return quaTrinh;
    }

    // Kiểm tra quyền giảng viên
    private QuaTrinhThucTap kiemTraQuyenGiangVien(
            Long maQuaTrinh,
            Authentication authentication) {

        GiangVien giangVien = layGiangVienDangNhap(authentication);

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy quá trình thực tập!"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đơn đăng ký thực tập!"));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new RuntimeException(
                    "Bạn không có quyền xem nhật ký của sinh viên này!");
        }

        return quaTrinh;
    }

    // 1. Sinh viên xem tất cả nhật ký của mình
    public List<NhatKy> danhSachCuaToi(Authentication authentication) {

        SinhVien sinhVien = laySinhVienDangNhap(authentication);

        List<NhatKy> ketQua = new ArrayList<>();

        List<QuaTrinhThucTap> danhSachQuaTrinh =
                quaTrinhRepository.findAll();

        for (QuaTrinhThucTap quaTrinh : danhSachQuaTrinh) {

            DangKyThucTap dangKy = dangKyRepository
                    .findById(quaTrinh.getMaDangKy())
                    .orElse(null);

            if (dangKy != null &&
                    dangKy.getMaSv().equals(sinhVien.getMaSv())) {

                ketQua.addAll(
                        nhatKyRepository.findByMaQuaTrinhOrderByNgayDesc(
                                quaTrinh.getMaQuaTrinh()
                        )
                );
            }
        }

        return ketQua;
    }

    // 2. Sinh viên xem nhật ký theo quá trình
    public List<NhatKy> danhSachTheoQuaTrinh(
            Long maQuaTrinh,
            Authentication authentication) {

        kiemTraQuyenTruyCap(maQuaTrinh, authentication);

        return nhatKyRepository
                .findByMaQuaTrinhOrderByNgayDesc(maQuaTrinh);
    }

    // 3. Giảng viên xem nhật ký theo quá trình được phân công
    @Transactional(readOnly = true)
    public List<NhatKy> danhSachTheoQuaTrinhCuaGiangVien(
            Long maQuaTrinh,
            Authentication authentication) {

        kiemTraQuyenGiangVien(maQuaTrinh, authentication);

        return nhatKyRepository
                .findByMaQuaTrinhOrderByNgayDesc(maQuaTrinh);
    }

    // 4. Sinh viên tạo nhật ký
    @Transactional
    public NhatKy taoNhatKy(
            Long maQuaTrinh,
            NhatKyRequest request,
            Authentication authentication) {

        if (request == null ||
                request.getNoiDung() == null ||
                request.getNoiDung().trim().isEmpty()) {

            throw new RuntimeException("Vui lòng nhập nội dung nhật ký!");
        }

        QuaTrinhThucTap quaTrinh =
                kiemTraQuyenTruyCap(maQuaTrinh, authentication);

        LocalDate ngay = request.getNgay() != null
                ? request.getNgay()
                : LocalDate.now();

        if (ngay.isBefore(quaTrinh.getNgayBatDau()) ||
                ngay.isAfter(quaTrinh.getNgayKetThuc())) {

            throw new RuntimeException(
                    "Ngày nhật ký phải nằm trong thời gian thực tập!");
        }

        NhatKy nhatKy = new NhatKy();
        nhatKy.setMaQuaTrinh(maQuaTrinh);
        nhatKy.setNgay(ngay);
        nhatKy.setNoiDung(request.getNoiDung().trim());

        return nhatKyRepository.save(nhatKy);
    }

    // 5. Sinh viên cập nhật nhật ký
    @Transactional
    public NhatKy capNhatNhatKy(
            Long maNhatKy,
            NhatKyRequest request,
            Authentication authentication) {

        if (request == null ||
                request.getNoiDung() == null ||
                request.getNoiDung().trim().isEmpty()) {

            throw new RuntimeException("Vui lòng nhập nội dung nhật ký!");
        }

        NhatKy nhatKy = nhatKyRepository
                .findById(maNhatKy)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhật ký!"));

        QuaTrinhThucTap quaTrinh = kiemTraQuyenTruyCap(
                nhatKy.getMaQuaTrinh(),
                authentication
        );

        LocalDate ngay = request.getNgay() != null
                ? request.getNgay()
                : nhatKy.getNgay();

        if (ngay.isBefore(quaTrinh.getNgayBatDau()) ||
                ngay.isAfter(quaTrinh.getNgayKetThuc())) {

            throw new RuntimeException(
                    "Ngày nhật ký phải nằm trong thời gian thực tập!");
        }

        nhatKy.setNgay(ngay);
        nhatKy.setNoiDung(request.getNoiDung().trim());

        return nhatKyRepository.save(nhatKy);
    }

    // 6. Sinh viên xóa nhật ký
    @Transactional
    public void xoaNhatKy(
            Long maNhatKy,
            Authentication authentication) {

        NhatKy nhatKy = nhatKyRepository
                .findById(maNhatKy)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhật ký!"));

        kiemTraQuyenTruyCap(
                nhatKy.getMaQuaTrinh(),
                authentication
        );

        nhatKyRepository.delete(nhatKy);
    }
}