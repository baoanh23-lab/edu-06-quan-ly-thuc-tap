
package edu06.edu06.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.NhatKy;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.entity.ViTriThucTap;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.NhatKyRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
@Transactional
public class QuaTrinhThucTapService {

    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final ViTriThucTapRepository viTriRepository;
    private final NhatKyRepository nhatKyRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;

    public QuaTrinhThucTapService(
            QuaTrinhThucTapRepository quaTrinhRepository,
            DangKyThucTapRepository dangKyRepository,
            TaiKhoanRepository taiKhoanRepository,
            SinhVienRepository sinhVienRepository,
            GiangVienRepository giangVienRepository,
            ViTriThucTapRepository viTriRepository,
            NhatKyRepository nhatKyRepository,
            DoanhNghiepRepository doanhNghiepRepository) {

        this.quaTrinhRepository = quaTrinhRepository;
        this.dangKyRepository = dangKyRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.giangVienRepository = giangVienRepository;
        this.viTriRepository = viTriRepository;
        this.nhatKyRepository = nhatKyRepository;
        this.doanhNghiepRepository = doanhNghiepRepository;
    }

    // =====================================================
    // 1. SINH VIÊN XEM QUÁ TRÌNH THỰC TẬP CỦA MÌNH
    // =====================================================

    public List<Map<String, Object>> danhSachCuaSinhVien(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));

        SinhVien sinhVien = sinhVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ sinh viên!"));

        List<Map<String, Object>> ketQua = new ArrayList<>();

        List<QuaTrinhThucTap> danhSach = quaTrinhRepository.findAll();

        for (QuaTrinhThucTap quaTrinh : danhSach) {

            DangKyThucTap dangKy = dangKyRepository
                    .findById(quaTrinh.getMaDangKy())
                    .orElse(null);

            if (dangKy == null
                    || !sinhVien.getMaSv().equals(dangKy.getMaSv())) {
                continue;
            }

            ketQua.add(chuyenDoiThongTin(quaTrinh, dangKy));
        }

        return ketQua;
    }

    // =====================================================
    // 2. GIẢNG VIÊN XEM QUÁ TRÌNH THỰC TẬP ĐƯỢC PHÂN CÔNG
    // =====================================================

    public List<Map<String, Object>> danhSachCuaGiangVien(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));

        GiangVien giangVien = giangVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ giảng viên!"));

        List<Map<String, Object>> ketQua = new ArrayList<>();

        List<QuaTrinhThucTap> danhSach = quaTrinhRepository.findAll();

        for (QuaTrinhThucTap quaTrinh : danhSach) {

            DangKyThucTap dangKy = dangKyRepository
                    .findById(quaTrinh.getMaDangKy())
                    .orElse(null);

            if (dangKy == null
                    || !giangVien.getMaGv().equals(dangKy.getMaGv())) {
                continue;
            }

            ketQua.add(chuyenDoiThongTin(quaTrinh, dangKy));
        }

        return ketQua;
    }

    // =====================================================
    // 3. TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI THEO NGÀY
    // =====================================================

    private void capNhatTrangThai(QuaTrinhThucTap quaTrinh) {

        LocalDate homNay = LocalDate.now(
                ZoneId.of("Asia/Ho_Chi_Minh")
        );

        LocalDate ngayBatDau = quaTrinh.getNgayBatDau();
        LocalDate ngayKetThuc = quaTrinh.getNgayKetThuc();

        if (ngayBatDau == null || ngayKetThuc == null) {
            return;
        }

        String trangThaiMoi;

        if (homNay.isBefore(ngayBatDau)) {
            trangThaiMoi = "CHUA_BAT_DAU";
        } else if (homNay.isAfter(ngayKetThuc)) {
            trangThaiMoi = "HOAN_THANH";
        } else {
            trangThaiMoi = "DANG_THUC_TAP";
        }

        if (!trangThaiMoi.equals(quaTrinh.getTrangThai())) {
            quaTrinh.setTrangThai(trangThaiMoi);
            quaTrinhRepository.save(quaTrinh);
        }
    }

    // =====================================================
    // 4. LẤY NỘI DUNG NHẬT KÝ MỚI NHẤT
    // =====================================================

    private String layTienDoMoiNhat(Long maQuaTrinh) {

        List<NhatKy> danhSachNhatKy =
                nhatKyRepository.findByMaQuaTrinhOrderByNgayDesc(
                        maQuaTrinh
                );

        if (danhSachNhatKy == null || danhSachNhatKy.isEmpty()) {
            return null;
        }

        return danhSachNhatKy.get(0).getNoiDung();
    }

    // =====================================================
    // 5. ĐỒNG BỘ TIẾN ĐỘ
    // =====================================================

    private void dongBoTienDo(QuaTrinhThucTap quaTrinh) {

        String tienDoMoiNhat = layTienDoMoiNhat(
                quaTrinh.getMaQuaTrinh()
        );

        String tienDo = tienDoMoiNhat != null
                && !tienDoMoiNhat.trim().isEmpty()
                ? tienDoMoiNhat
                : "Chưa có nhật ký thực tập";

        if (!tienDo.equals(quaTrinh.getTienDo())) {
            quaTrinh.setTienDo(tienDo);
            quaTrinhRepository.save(quaTrinh);
        }
    }

    // =====================================================
    // 6. CHUYỂN ĐỔI THÔNG TIN QUÁ TRÌNH THỰC TẬP
    // =====================================================

    private Map<String, Object> chuyenDoiThongTin(
            QuaTrinhThucTap quaTrinh,
            DangKyThucTap dangKy) {

        capNhatTrangThai(quaTrinh);
        dongBoTienDo(quaTrinh);

        ViTriThucTap viTri = viTriRepository
                .findById(dangKy.getMaViTri())
                .orElse(null);

        SinhVien sinhVien = sinhVienRepository
                .findById(dangKy.getMaSv())
                .orElse(null);

        DoanhNghiep doanhNghiep = null;

        if (viTri != null && viTri.getMaDn() != null) {
            doanhNghiep = doanhNghiepRepository
                    .findById(viTri.getMaDn())
                    .orElse(null);
        }

        Map<String, Object> item = new HashMap<>();

        item.put("maQuaTrinh", quaTrinh.getMaQuaTrinh());
        item.put("maDangKy", quaTrinh.getMaDangKy());

        item.put("maSv", dangKy.getMaSv());
        item.put("maGv", dangKy.getMaGv());

        item.put("hoTenSinhVien",
                sinhVien != null ? sinhVien.getHoTen() : null);

        item.put("emailSinhVien",
                sinhVien != null ? sinhVien.getEmail() : null);

        item.put("soDienThoaiSinhVien",
                sinhVien != null ? sinhVien.getSoDienThoai() : null);

        item.put("maViTri", dangKy.getMaViTri());

        item.put("tenViTri",
                viTri != null ? viTri.getTenViTri() : null);

        item.put("maDn",
                viTri != null ? viTri.getMaDn() : null);

        item.put("tenDoanhNghiep",
                doanhNghiep != null ? doanhNghiep.getTenDn() : null);

        item.put("diaChiDoanhNghiep",
                doanhNghiep != null ? doanhNghiep.getDiaChi() : null);

        item.put("soDienThoaiDoanhNghiep",
                doanhNghiep != null ? doanhNghiep.getSoDienThoai() : null);

        item.put("ngayDangKy", dangKy.getNgayDangKy());

        item.put("ngayBatDau", quaTrinh.getNgayBatDau());
        item.put("ngayKetThuc", quaTrinh.getNgayKetThuc());

        item.put("tienDo", quaTrinh.getTienDo());
        item.put("trangThai", quaTrinh.getTrangThai());

        return item;
    }

    // =====================================================
    // 3. DOANH NGHIỆP XEM QUÁ TRÌNH THỰC TẬP CỦA SINH VIÊN
    // =====================================================

    public List<Map<String, Object>> danhSachCuaDoanhNghiep(
        Authentication authentication) {

    if (authentication == null || !authentication.isAuthenticated()) {
        throw new RuntimeException("Bạn chưa đăng nhập!");
    }

    TaiKhoan taiKhoan = taiKhoanRepository
            .findByUsername(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("Không tìm thấy tài khoản!"));

    DoanhNghiep doanhNghiep = doanhNghiepRepository
            .findByIdTaiKhoan(taiKhoan.getId())
            .orElseThrow(() ->
                    new RuntimeException("Không tìm thấy hồ sơ doanh nghiệp!"));

    List<Map<String, Object>> ketQua = new ArrayList<>();

    List<QuaTrinhThucTap> danhSach = quaTrinhRepository.findAll();

    for (QuaTrinhThucTap quaTrinh : danhSach) {

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElse(null);

        if (dangKy == null
                || !"CHAP_NHAN".equals(dangKy.getTrangThaiDn())) {
            continue;
        }

        ViTriThucTap viTri = viTriRepository
                .findById(dangKy.getMaViTri())
                .orElse(null);

        if (viTri == null
                || !doanhNghiep.getMaDn().equals(viTri.getMaDn())) {
            continue;
        }

        ketQua.add(chuyenDoiThongTin(quaTrinh, dangKy));
    }

        return ketQua;
        }

}
