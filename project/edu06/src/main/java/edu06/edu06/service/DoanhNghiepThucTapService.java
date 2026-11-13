package edu06.edu06.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.NhatKy;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.entity.ViTriThucTap;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.NhatKyRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
@Transactional(readOnly = true)
public class DoanhNghiepThucTapService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;
    private final ViTriThucTapRepository viTriRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final SinhVienRepository sinhVienRepository;
    private final NhatKyRepository nhatKyRepository;

    public DoanhNghiepThucTapService(
            TaiKhoanRepository taiKhoanRepository,
            DoanhNghiepRepository doanhNghiepRepository,
            ViTriThucTapRepository viTriRepository,
            DangKyThucTapRepository dangKyRepository,
            QuaTrinhThucTapRepository quaTrinhRepository,
            SinhVienRepository sinhVienRepository,
            NhatKyRepository nhatKyRepository) {

        this.taiKhoanRepository = taiKhoanRepository;
        this.doanhNghiepRepository = doanhNghiepRepository;
        this.viTriRepository = viTriRepository;
        this.dangKyRepository = dangKyRepository;
        this.quaTrinhRepository = quaTrinhRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.nhatKyRepository = nhatKyRepository;
    }

    // Lấy doanh nghiệp đang đăng nhập
    private DoanhNghiep layDoanhNghiepDangNhap(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));

        return doanhNghiepRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ doanh nghiệp!"));
    }

    // Lấy đăng ký và kiểm tra có thuộc doanh nghiệp đang đăng nhập
    private DangKyThucTap kiemTraQuyenTruyCap(
            Long maQuaTrinh,
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepDangNhap(authentication);

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy quá trình thực tập!"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đăng ký thực tập!"));

        ViTriThucTap viTri = viTriRepository
                .findById(dangKy.getMaViTri())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy vị trí thực tập!"));

        if (!doanhNghiep.getMaDn().equals(viTri.getMaDn())) {
            throw new RuntimeException(
                    "Bạn không có quyền xem quá trình thực tập này!");
        }

        if (!"CHAP_NHAN".equals(dangKy.getTrangThaiDn())) {
            throw new RuntimeException(
                    "Đăng ký thực tập chưa được doanh nghiệp chấp nhận!");
        }

        return dangKy;
    }

    // Danh sách quá trình thực tập của doanh nghiệp
    public List<Map<String, Object>> danhSachQuaTrinh(
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepDangNhap(authentication);

        List<ViTriThucTap> viTriList =
                viTriRepository.findByMaDn(doanhNghiep.getMaDn());

        List<Map<String, Object>> ketQua = new ArrayList<>();

        if (viTriList.isEmpty()) {
            return ketQua;
        }

        List<Long> maViTris = viTriList.stream()
                .map(ViTriThucTap::getMaViTri)
                .toList();

        List<DangKyThucTap> dangKyList =
                dangKyRepository.findByMaViTriIn(maViTris);

        for (DangKyThucTap dangKy : dangKyList) {

            if (!"CHAP_NHAN".equals(dangKy.getTrangThaiDn())) {
                continue;
            }

            QuaTrinhThucTap quaTrinh = quaTrinhRepository
                    .findByMaDangKy(dangKy.getMaDangKy())
                    .orElse(null);

            if (quaTrinh == null) {
                continue;
            }

            ViTriThucTap viTri = viTriRepository
                    .findById(dangKy.getMaViTri())
                    .orElse(null);

            SinhVien sinhVien = sinhVienRepository
                    .findById(dangKy.getMaSv())
                    .orElse(null);

            Map<String, Object> item = new HashMap<>();

            item.put("maQuaTrinh", quaTrinh.getMaQuaTrinh());
            item.put("maDangKy", dangKy.getMaDangKy());
            item.put("maSv", dangKy.getMaSv());

            item.put(
                    "tenSinhVien",
                    sinhVien != null ? sinhVien.getHoTen() : dangKy.getMaSv()
            );

            item.put(
                    "tenViTri",
                    viTri != null ? viTri.getTenViTri() : "Chưa có"
            );

            item.put("ngayBatDau", quaTrinh.getNgayBatDau());
            item.put("ngayKetThuc", quaTrinh.getNgayKetThuc());
            item.put("tienDo", quaTrinh.getTienDo());
            item.put("trangThai", quaTrinh.getTrangThai());

            ketQua.add(item);
        }

        return ketQua;
    }

    // Chi tiết quá trình thực tập
    public Map<String, Object> chiTietQuaTrinh(
            Long maQuaTrinh,
            Authentication authentication) {

        DangKyThucTap dangKy =
                kiemTraQuyenTruyCap(maQuaTrinh, authentication);

        QuaTrinhThucTap quaTrinh =
                quaTrinhRepository.findById(maQuaTrinh)
                        .orElseThrow(() ->
                                new RuntimeException("Không tìm thấy quá trình!"));

        SinhVien sinhVien = sinhVienRepository
                .findById(dangKy.getMaSv())
                .orElse(null);

        ViTriThucTap viTri = viTriRepository
                .findById(dangKy.getMaViTri())
                .orElse(null);

        Map<String, Object> ketQua = new HashMap<>();

        ketQua.put("maQuaTrinh", quaTrinh.getMaQuaTrinh());
        ketQua.put("maDangKy", dangKy.getMaDangKy());
        ketQua.put("maSv", dangKy.getMaSv());

        ketQua.put(
                "tenSinhVien",
                sinhVien != null ? sinhVien.getHoTen() : dangKy.getMaSv()
        );

        ketQua.put(
                "email",
                sinhVien != null ? sinhVien.getEmail() : null
        );

        ketQua.put(
                "soDienThoai",
                sinhVien != null ? sinhVien.getSoDienThoai() : null
        );

        ketQua.put(
                "tenViTri",
                viTri != null ? viTri.getTenViTri() : "Chưa có"
        );

        ketQua.put("ngayBatDau", quaTrinh.getNgayBatDau());
        ketQua.put("ngayKetThuc", quaTrinh.getNgayKetThuc());
        ketQua.put("tienDo", quaTrinh.getTienDo());
        ketQua.put("trangThai", quaTrinh.getTrangThai());

        return ketQua;
    }

    // Nhật ký theo quá trình
    public List<NhatKy> danhSachNhatKy(
            Long maQuaTrinh,
            Authentication authentication) {

        kiemTraQuyenTruyCap(maQuaTrinh, authentication);

        return nhatKyRepository
                .findByMaQuaTrinhOrderByNgayDesc(maQuaTrinh);
    }
}