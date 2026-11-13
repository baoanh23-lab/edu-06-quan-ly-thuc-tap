
package edu06.edu06.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import edu06.edu06.dto.DanhGiaRequest;
import edu06.edu06.dto.DanhGiaResponse;
import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DanhGia;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.entity.ViTriThucTap;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DanhGiaRepository;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
public class DanhGiaService {

    private static final String LOAI_GIANG_VIEN = "GIANG_VIEN";
    private static final String LOAI_DOANH_NGHIEP = "DOANH_NGHIEP";
    private static final String DA_CHAP_NHAN = "CHAP_NHAN";

    private final DanhGiaRepository danhGiaRepository;
    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final GiangVienRepository giangVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;
    private final ViTriThucTapRepository viTriRepository;

    public DanhGiaService(
            DanhGiaRepository danhGiaRepository,
            QuaTrinhThucTapRepository quaTrinhRepository,
            DangKyThucTapRepository dangKyRepository,
            GiangVienRepository giangVienRepository,
            TaiKhoanRepository taiKhoanRepository,
            DoanhNghiepRepository doanhNghiepRepository,
            ViTriThucTapRepository viTriRepository) {

        this.danhGiaRepository = danhGiaRepository;
        this.quaTrinhRepository = quaTrinhRepository;
        this.dangKyRepository = dangKyRepository;
        this.giangVienRepository = giangVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.doanhNghiepRepository = doanhNghiepRepository;
        this.viTriRepository = viTriRepository;
    }

    // =========================
    // PHẦN DÀNH CHO GIẢNG VIÊN
    // =========================

    private GiangVien layGiangVienDangNhap(String username) {

        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản đăng nhập"));

        return giangVienRepository.findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin giảng viên"));
    }

    private QuaTrinhThucTap kiemTraQuyen(
            Long maQuaTrinh, String username) {

        GiangVien giangVien = layGiangVienDangNhap(username);

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy quá trình thực tập"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đăng ký thực tập"));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không được phân công hướng dẫn sinh viên này");
        }

        return quaTrinh;
    }

    @Transactional(readOnly = true)
    public List<DanhGiaResponse> layDanhSachDanhGia(String username) {

        GiangVien giangVien = layGiangVienDangNhap(username);

        List<DanhGiaResponse> ketQua = new ArrayList<>();

        List<QuaTrinhThucTap> danhSachQuaTrinh =
                quaTrinhRepository.findAll();

        for (QuaTrinhThucTap quaTrinh : danhSachQuaTrinh) {

            DangKyThucTap dangKy = dangKyRepository
                    .findById(quaTrinh.getMaDangKy())
                    .orElse(null);

            if (dangKy == null ||
                    !giangVien.getMaGv().equals(dangKy.getMaGv())) {
                continue;
            }

            DanhGiaResponse response = taoResponse(quaTrinh, dangKy);

            danhGiaRepository
                    .findByMaQuaTrinhAndLoaiDanhGia(
                            quaTrinh.getMaQuaTrinh(), LOAI_GIANG_VIEN)
                    .ifPresent(danhGia -> ganThongTinDanhGia(response, danhGia));

            ketQua.add(response);
        }

        return ketQua;
    }

    @Transactional(readOnly = true)
    public DanhGiaResponse xemDanhGia(
            Long maQuaTrinh, String username) {

        QuaTrinhThucTap quaTrinh =
                kiemTraQuyen(maQuaTrinh, username);

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đăng ký thực tập"));

        DanhGiaResponse response = taoResponse(quaTrinh, dangKy);

        danhGiaRepository
                .findByMaQuaTrinhAndLoaiDanhGia(
                        maQuaTrinh, LOAI_GIANG_VIEN)
                .ifPresent(danhGia -> ganThongTinDanhGia(response, danhGia));

        return response;
    }

    @Transactional
    public DanhGiaResponse taoDanhGia(
            Long maQuaTrinh,
            DanhGiaRequest request,
            String username) {

        QuaTrinhThucTap quaTrinh =
                kiemTraQuyen(maQuaTrinh, username);

        kiemTraDiem(request);

        if (danhGiaRepository.existsByMaQuaTrinhAndLoaiDanhGia(
                maQuaTrinh, LOAI_GIANG_VIEN)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Quá trình thực tập này đã được giảng viên đánh giá");
        }

        GiangVien giangVien = layGiangVienDangNhap(username);

        DanhGia danhGia = new DanhGia();

        danhGia.setMaQuaTrinh(quaTrinh.getMaQuaTrinh());
        danhGia.setMaGv(giangVien.getMaGv());
        danhGia.setMaDn(null);
        danhGia.setDiem(request.getDiem());
        danhGia.setNoiDung(request.getNoiDung());
        danhGia.setLoaiDanhGia(LOAI_GIANG_VIEN);
        danhGia.setNgayDanhGia(LocalDateTime.now());

        danhGiaRepository.save(danhGia);

        return xemDanhGia(maQuaTrinh, username);
    }

    // =========================
    // PHẦN DÀNH CHO DOANH NGHIỆP
    // =========================

    private DoanhNghiep layDoanhNghiepDangNhap(String username) {

        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản đăng nhập"));

        return doanhNghiepRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin doanh nghiệp"));
    }

    // Kiểm tra quá trình có thuộc doanh nghiệp đang đăng nhập không
    private QuaTrinhThucTap kiemTraQuyenDoanhNghiep(
            Long maQuaTrinh, String username) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepDangNhap(username);

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy quá trình thực tập"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đăng ký thực tập"));

        ViTriThucTap viTri = viTriRepository
                .findById(dangKy.getMaViTri())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy vị trí thực tập"));

        if (!Objects.equals(
                doanhNghiep.getMaDn(), viTri.getMaDn())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền đánh giá sinh viên này");
        }

        if (!DA_CHAP_NHAN.equals(dangKy.getTrangThaiDn())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Đăng ký thực tập chưa được doanh nghiệp chấp nhận");
        }

        return quaTrinh;
    }

    // Danh sách sinh viên đang thực tập tại doanh nghiệp
    @Transactional(readOnly = true)
    public List<DanhGiaResponse> layDanhSachDanhGiaDoanhNghiep(
            String username) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepDangNhap(username);

        List<DanhGiaResponse> ketQua = new ArrayList<>();

        List<QuaTrinhThucTap> danhSachQuaTrinh =
                quaTrinhRepository.findAll();

        for (QuaTrinhThucTap quaTrinh : danhSachQuaTrinh) {

            DangKyThucTap dangKy = dangKyRepository
                    .findById(quaTrinh.getMaDangKy())
                    .orElse(null);

            if (dangKy == null ||
                    !DA_CHAP_NHAN.equals(dangKy.getTrangThaiDn())) {
                continue;
            }

            ViTriThucTap viTri = viTriRepository
                    .findById(dangKy.getMaViTri())
                    .orElse(null);

            if (viTri == null ||
                    !Objects.equals(
                            doanhNghiep.getMaDn(), viTri.getMaDn())) {
                continue;
            }

            DanhGiaResponse response = taoResponse(quaTrinh, dangKy);

            danhGiaRepository
                    .findByMaQuaTrinhAndLoaiDanhGia(
                            quaTrinh.getMaQuaTrinh(), LOAI_DOANH_NGHIEP)
                    .ifPresent(danhGia -> ganThongTinDanhGia(response, danhGia));

            ketQua.add(response);
        }

        return ketQua;
    }

    // Xem đánh giá của doanh nghiệp đối với một sinh viên
    @Transactional(readOnly = true)
    public DanhGiaResponse xemDanhGiaDoanhNghiep(
            Long maQuaTrinh, String username) {

        QuaTrinhThucTap quaTrinh =
                kiemTraQuyenDoanhNghiep(maQuaTrinh, username);

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đăng ký thực tập"));

        DanhGiaResponse response = taoResponse(quaTrinh, dangKy);

        danhGiaRepository
                .findByMaQuaTrinhAndLoaiDanhGia(
                        maQuaTrinh, LOAI_DOANH_NGHIEP)
                .ifPresent(danhGia -> ganThongTinDanhGia(response, danhGia));

        return response;
    }

    // Doanh nghiệp gửi đánh giá sinh viên
    @Transactional
    public DanhGiaResponse taoDanhGiaDoanhNghiep(
            Long maQuaTrinh,
            DanhGiaRequest request,
            String username) {

        QuaTrinhThucTap quaTrinh =
                kiemTraQuyenDoanhNghiep(maQuaTrinh, username);

        kiemTraDiem(request);

        if (danhGiaRepository.existsByMaQuaTrinhAndLoaiDanhGia(
                maQuaTrinh, LOAI_DOANH_NGHIEP)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Sinh viên này đã được doanh nghiệp đánh giá");
        }

        DoanhNghiep doanhNghiep =
                layDoanhNghiepDangNhap(username);

        DanhGia danhGia = new DanhGia();

        danhGia.setMaQuaTrinh(quaTrinh.getMaQuaTrinh());
        danhGia.setMaDn(doanhNghiep.getMaDn());
        danhGia.setMaGv(null);
        danhGia.setDiem(request.getDiem());
        danhGia.setNoiDung(request.getNoiDung());
        danhGia.setLoaiDanhGia(LOAI_DOANH_NGHIEP);
        danhGia.setNgayDanhGia(LocalDateTime.now());

        danhGiaRepository.save(danhGia);

        return xemDanhGiaDoanhNghiep(maQuaTrinh, username);
    }

    // =========================
    // HÀM DÙNG CHUNG
    // =========================

    private void kiemTraDiem(DanhGiaRequest request) {

        if (request == null || request.getDiem() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập điểm đánh giá");
        }

        if (request.getDiem().compareTo(BigDecimal.ZERO) < 0 ||
                request.getDiem().compareTo(BigDecimal.TEN) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Điểm đánh giá phải từ 0 đến 10");
        }
    }

    private void ganThongTinDanhGia(
            DanhGiaResponse response, DanhGia danhGia) {

        response.setDaDanhGia(true);
        response.setMaDanhGia(danhGia.getMaDanhGia());
        response.setDiem(danhGia.getDiem());
        response.setNoiDung(danhGia.getNoiDung());
        response.setNgayDanhGia(danhGia.getNgayDanhGia());
    }

    private DanhGiaResponse taoResponse(
            QuaTrinhThucTap quaTrinh,
            DangKyThucTap dangKy) {

        DanhGiaResponse response = new DanhGiaResponse();

        response.setMaQuaTrinh(quaTrinh.getMaQuaTrinh());
        response.setMaDangKy(dangKy.getMaDangKy());
        response.setMaSv(dangKy.getMaSv());
        response.setNgayBatDau(quaTrinh.getNgayBatDau());
        response.setNgayKetThuc(quaTrinh.getNgayKetThuc());
        response.setTrangThaiQuaTrinh(quaTrinh.getTrangThai());
        response.setDaDanhGia(false);

        return response;
    }
}
