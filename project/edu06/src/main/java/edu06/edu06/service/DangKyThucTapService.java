
package edu06.edu06.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.dto.XacNhanDangKyThucTapRequest;
import edu06.edu06.entity.DangKyGiangVien;
import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.entity.ViTriThucTap;
import edu06.edu06.repository.DangKyGiangVienRepository;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
public class DangKyThucTapService {

    private final DangKyThucTapRepository dangKyRepository;
    private final DangKyGiangVienRepository dangKyGiangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final ViTriThucTapRepository viTriRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;
    private final GiangVienRepository giangVienRepository;
    private final QuaTrinhThucTapRepository quaTrinhThucTapRepository;

    public DangKyThucTapService(
            DangKyThucTapRepository dangKyRepository,
            DangKyGiangVienRepository dangKyGiangVienRepository,
            SinhVienRepository sinhVienRepository,
            TaiKhoanRepository taiKhoanRepository,
            ViTriThucTapRepository viTriRepository,
            DoanhNghiepRepository doanhNghiepRepository,
            GiangVienRepository giangVienRepository,
            QuaTrinhThucTapRepository quaTrinhThucTapRepository) {

        this.dangKyRepository = dangKyRepository;
        this.dangKyGiangVienRepository = dangKyGiangVienRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.viTriRepository = viTriRepository;
        this.doanhNghiepRepository = doanhNghiepRepository;
        this.giangVienRepository = giangVienRepository;
        this.quaTrinhThucTapRepository = quaTrinhThucTapRepository;
    }

    // =====================================================
    // 1. SINH VIÊN ĐĂNG KÝ THỰC TẬP
    // =====================================================

    @Transactional
    public DangKyThucTap dangKy(
            Long maViTri,
            String noiDung,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        String username = authentication.getName();

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));

        SinhVien sinhVien = sinhVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ sinh viên!"));

        if (maViTri == null) {
            throw new RuntimeException("Vui lòng chọn vị trí thực tập!");
        }

        ViTriThucTap viTri = viTriRepository
                .findById(maViTri)
                .orElseThrow(() ->
                        new RuntimeException("Vị trí thực tập không tồn tại!"));

        if (!"DANG_MO".equals(viTri.getTrangThai())) {
            throw new RuntimeException(
                    "Vị trí thực tập hiện không mở đăng ký!");
        }

        if (dangKyRepository.existsByMaSvAndMaViTri(
                sinhVien.getMaSv(), maViTri)) {

            throw new RuntimeException(
                    "Bạn đã đăng ký vị trí này rồi!");
        }

        // Kiểm tra sinh viên đã được doanh nghiệp chấp nhận chưa
        List<DangKyThucTap> cacDonTruocDo =
                dangKyRepository.findByMaSvOrderByNgayDangKyDesc(
                        sinhVien.getMaSv());

        boolean daDuocDoanhNghiepNhan = cacDonTruocDo.stream()
                .anyMatch(dk -> {
                    String trangThaiDn = dk.getTrangThaiDn();

                    return "CHAP_NHAN".equalsIgnoreCase(trangThaiDn)
                            || "DA_DUYET".equalsIgnoreCase(trangThaiDn)
                            || "DA_CHAP_NHAN".equalsIgnoreCase(trangThaiDn)
                            || "DONG_Y".equalsIgnoreCase(trangThaiDn);
                });

        if (daDuocDoanhNghiepNhan) {
            throw new RuntimeException(
                    "Bạn đã được một doanh nghiệp chấp nhận thực tập. "
                    + "Không thể đăng ký thêm vị trí thực tập!");
        }

        // Kiểm tra sinh viên đã có giảng viên hướng dẫn được duyệt
        DangKyGiangVien dangKyGiangVien =
                dangKyGiangVienRepository
                        .findFirstByMaSvAndTrangThaiOrderByNgayDangKyDesc(
                                sinhVien.getMaSv(), "DA_DUYET")
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Bạn chưa có giảng viên hướng dẫn được duyệt!"));

        String maGv = dangKyGiangVien.getMaGv();

        DangKyThucTap dangKy = new DangKyThucTap();

        dangKy.setMaSv(sinhVien.getMaSv());
        dangKy.setMaViTri(maViTri);
        dangKy.setMaGv(maGv);
        dangKy.setNgayDangKy(LocalDate.now());
        dangKy.setNoiDung(noiDung);

        dangKy.setTrangThaiGv("CHO_DUYET");
        dangKy.setTrangThaiDn("CHO_DUYET");
        dangKy.setTrangThai("CHO_DUYET");

        return dangKyRepository.save(dangKy);
    }

    // =====================================================
    // 2. SINH VIÊN XEM DANH SÁCH ĐƠN ĐĂNG KÝ CỦA MÌNH
    // =====================================================

    public List<Map<String, Object>> danhSachDangKyCuaToi(
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

        List<DangKyThucTap> danhSach =
                dangKyRepository.findByMaSvOrderByNgayDangKyDesc(
                        sinhVien.getMaSv());

        List<Map<String, Object>> ketQua = new ArrayList<>();

        for (DangKyThucTap dk : danhSach) {

            ViTriThucTap viTri = viTriRepository
                    .findById(dk.getMaViTri())
                    .orElse(null);

            Map<String, Object> item = new HashMap<>();

            item.put("maDangKy", dk.getMaDangKy());
            item.put("maSv", dk.getMaSv());
            item.put("maViTri", dk.getMaViTri());
            item.put("tenViTri",
                    viTri != null ? viTri.getTenViTri() : null);
            item.put("ngayDangKy", dk.getNgayDangKy());
            item.put("noiDung", dk.getNoiDung());
            item.put("maGv", dk.getMaGv());
            item.put("trangThaiDn", dk.getTrangThaiDn());
            item.put("trangThaiGv", dk.getTrangThaiGv());
            item.put("trangThai", dk.getTrangThai());

            ketQua.add(item);
        }

        return ketQua;
    }

    // =====================================================
    // 3. LẤY DOANH NGHIỆP ĐANG ĐĂNG NHẬP
    // =====================================================

    private DoanhNghiep layDoanhNghiepDangNhap(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));

        return doanhNghiepRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy hồ sơ doanh nghiệp!"));
    }

    // =====================================================
    // 4. DOANH NGHIỆP XEM DANH SÁCH ĐĂNG KÝ
    // =====================================================

    public List<Map<String, Object>> danhSachDangKyDoanhNghiep(
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepDangNhap(authentication);

        List<ViTriThucTap> viTris =
                viTriRepository.findByMaDn(doanhNghiep.getMaDn());

        if (viTris.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> maViTris = new ArrayList<>();

        for (ViTriThucTap viTri : viTris) {
            maViTris.add(viTri.getMaViTri());
        }

        List<DangKyThucTap> danhSach =
                dangKyRepository.findByMaViTriIn(maViTris);

        List<Map<String, Object>> ketQua = new ArrayList<>();

        for (DangKyThucTap dk : danhSach) {

            ViTriThucTap viTri = viTriRepository
                    .findById(dk.getMaViTri())
                    .orElse(null);

            Map<String, Object> item = new HashMap<>();

            item.put("maDangKy", dk.getMaDangKy());
            item.put("maSv", dk.getMaSv());
            item.put("maViTri", dk.getMaViTri());
            item.put("tenViTri",
                    viTri != null ? viTri.getTenViTri() : null);
            item.put("ngayDangKy", dk.getNgayDangKy());
            item.put("noiDung", dk.getNoiDung());
            item.put("maGv", dk.getMaGv());
            item.put("trangThaiDn", dk.getTrangThaiDn());
            item.put("trangThaiGv", dk.getTrangThaiGv());
            item.put("trangThai", dk.getTrangThai());

            ketQua.add(item);
        }

        return ketQua;
    }

    // =====================================================
    // 5. DOANH NGHIỆP CHẤP NHẬN HOẶC TỪ CHỐI ĐĂNG KÝ
    // =====================================================

    @Transactional
    public DangKyThucTap xuLyDangKy(
            Long maDangKy,
            boolean chapNhan,
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepDangNhap(authentication);

        DangKyThucTap dangKy = dangKyRepository
                .findById(maDangKy)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy đăng ký thực tập!"));

        ViTriThucTap viTri = viTriRepository
                .findById(dangKy.getMaViTri())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy vị trí thực tập!"));

        if (!doanhNghiep.getMaDn().equals(viTri.getMaDn())) {
            throw new RuntimeException(
                    "Bạn không có quyền xử lý đăng ký này!");
        }

        if (!"CHO_DUYET".equals(dangKy.getTrangThaiDn())) {
            throw new RuntimeException(
                    "Đăng ký này đã được doanh nghiệp xử lý trước đó!");
        }

        if ("TU_CHOI".equals(dangKy.getTrangThaiGv())) {
            throw new RuntimeException(
                    "Đơn này đã bị giảng viên từ chối!");
        }

        if (chapNhan) {

            long soLuongDaNhan =
                    dangKyRepository.countByMaViTriAndTrangThaiDn(
                            dangKy.getMaViTri(),
                            "CHAP_NHAN");

            if (soLuongDaNhan >= viTri.getSoLuong()) {
                throw new RuntimeException(
                        "Vị trí thực tập đã đủ số lượng tuyển dụng!");
            }

            dangKy.setTrangThaiDn("CHAP_NHAN");

            if ("DA_DUYET".equals(dangKy.getTrangThaiGv())) {
                dangKy.setTrangThai("DA_DUYET");
            } else {
                dangKy.setTrangThai("CHO_DUYET");
            }

        } else {

            dangKy.setTrangThaiDn("TU_CHOI");
            dangKy.setTrangThai("TU_CHOI");
        }

        return dangKyRepository.save(dangKy);
    }

    // =====================================================
    // 6. GIẢNG VIÊN XEM DANH SÁCH ĐƠN THỰC TẬP
    // =====================================================

    public List<Map<String, Object>> danhSachDangKyGiangVien(
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

        List<DangKyThucTap> danhSach =
                dangKyRepository.findByMaGv(giangVien.getMaGv());

        List<Map<String, Object>> ketQua = new ArrayList<>();

        for (DangKyThucTap dk : danhSach) {

            ViTriThucTap viTri = viTriRepository
                    .findById(dk.getMaViTri())
                    .orElse(null);

            Map<String, Object> item = new HashMap<>();

            item.put("maDangKy", dk.getMaDangKy());
            item.put("maSv", dk.getMaSv());
            item.put("maViTri", dk.getMaViTri());
            item.put("tenViTri",
                    viTri != null ? viTri.getTenViTri() : null);
            item.put("ngayDangKy", dk.getNgayDangKy());
            item.put("noiDung", dk.getNoiDung());
            item.put("maGv", dk.getMaGv());
            item.put("trangThaiDn", dk.getTrangThaiDn());
            item.put("trangThaiGv", dk.getTrangThaiGv());
            item.put("trangThai", dk.getTrangThai());

            ketQua.add(item);
        }

        return ketQua;
    }

    // =====================================================
    // 7. GIẢNG VIÊN CHẤP NHẬN ĐƠN VÀ TẠO QUÁ TRÌNH THỰC TẬP
    // =====================================================

    @Transactional
    public DangKyThucTap giangVienChapNhan(
            Long maDangKy,
            XacNhanDangKyThucTapRequest request,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        if (request == null
                || request.getNgayBatDau() == null
                || request.getNgayKetThuc() == null) {

            throw new RuntimeException(
                    "Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc!");
        }

        if (request.getNgayBatDau().isAfter(request.getNgayKetThuc())) {
            throw new RuntimeException(
                    "Ngày bắt đầu không được sau ngày kết thúc!");
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));

        GiangVien giangVien = giangVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ giảng viên!"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(maDangKy)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đơn thực tập!"));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new RuntimeException(
                    "Bạn không có quyền xử lý đơn thực tập này!");
        }

        if ("TU_CHOI".equals(dangKy.getTrangThaiDn())) {
            throw new RuntimeException(
                    "Doanh nghiệp đã từ chối đơn thực tập này!");
        }

        if ("TU_CHOI".equals(dangKy.getTrangThaiGv())) {
            throw new RuntimeException(
                    "Đơn thực tập này đã bị giảng viên từ chối!");
        }

        if (!"CHO_DUYET".equals(dangKy.getTrangThaiGv())) {
            throw new RuntimeException(
                    "Đơn thực tập này đã được giảng viên xử lý!");
        }

        if (!"CHAP_NHAN".equals(dangKy.getTrangThaiDn())) {
            throw new RuntimeException(
                    "Vui lòng chờ doanh nghiệp chấp nhận trước khi duyệt!");
        }

        if (quaTrinhThucTapRepository.existsByMaDangKy(maDangKy)) {
            throw new RuntimeException(
                    "Đơn này đã có quá trình thực tập!");
        }

        // Cập nhật trạng thái đơn
        dangKy.setTrangThaiGv("DA_DUYET");
        dangKy.setTrangThai("DA_DUYET");

        dangKyRepository.save(dangKy);

        // Chỉ tạo quá trình khi cả hai bên cùng chấp nhận
        QuaTrinhThucTap quaTrinh = new QuaTrinhThucTap();

        quaTrinh.setMaDangKy(maDangKy);
        quaTrinh.setNgayBatDau(request.getNgayBatDau());
        quaTrinh.setNgayKetThuc(request.getNgayKetThuc());
        quaTrinh.setTrangThai("CHUA_BAT_DAU");

        quaTrinhThucTapRepository.save(quaTrinh);

        return dangKy;
    }

    // =====================================================
    // 8. GIẢNG VIÊN TỪ CHỐI ĐƠN THỰC TẬP
    // =====================================================

    @Transactional
    public DangKyThucTap giangVienTuChoi(
            Long maDangKy,
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

        DangKyThucTap dangKy = dangKyRepository
                .findById(maDangKy)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đơn thực tập!"));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new RuntimeException(
                    "Bạn không có quyền xử lý đơn thực tập này!");
        }

        if (!"CHO_DUYET".equals(dangKy.getTrangThaiGv())) {
            throw new RuntimeException(
                    "Đơn thực tập này đã được giảng viên xử lý!");
        }

        if ("TU_CHOI".equals(dangKy.getTrangThaiDn())) {
            throw new RuntimeException(
                    "Doanh nghiệp đã từ chối đơn thực tập này!");
        }

        dangKy.setTrangThaiGv("TU_CHOI");
        dangKy.setTrangThai("TU_CHOI");

        return dangKyRepository.save(dangKy);
    }
}
