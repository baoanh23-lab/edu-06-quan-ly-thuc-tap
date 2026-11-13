
package edu06.edu06.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import edu06.edu06.entity.BaoCao;
import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DanhGia;
import edu06.edu06.entity.DoiSoatDanhGia;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.KetQua;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.repository.BaoCaoRepository;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DanhGiaRepository;
import edu06.edu06.repository.DoiSoatDanhGiaRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.KetQuaRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;

@Service
public class KetQuaService {

    private final KetQuaRepository ketQuaRepository;
    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final DoiSoatDanhGiaRepository doiSoatRepository;
    private final BaoCaoRepository baoCaoRepository;
    private final GiangVienRepository giangVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SinhVienRepository sinhVienRepository;

    public KetQuaService(
            KetQuaRepository ketQuaRepository,
            QuaTrinhThucTapRepository quaTrinhRepository,
            DangKyThucTapRepository dangKyRepository,
            DanhGiaRepository danhGiaRepository,
            DoiSoatDanhGiaRepository doiSoatRepository,
            BaoCaoRepository baoCaoRepository,
            GiangVienRepository giangVienRepository,
            TaiKhoanRepository taiKhoanRepository,
            SinhVienRepository sinhVienRepository) {

        this.ketQuaRepository = ketQuaRepository;
        this.quaTrinhRepository = quaTrinhRepository;
        this.dangKyRepository = dangKyRepository;
        this.danhGiaRepository = danhGiaRepository;
        this.doiSoatRepository = doiSoatRepository;
        this.baoCaoRepository = baoCaoRepository;
        this.giangVienRepository = giangVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.sinhVienRepository = sinhVienRepository;
    }

    // DTO danh sách sinh viên chờ xác nhận dành cho giảng viên
    public record KetQuaDanhSachDTO(
            Long maQuaTrinh,
            Long maDangKy,
            String maSv,
            String ketQua,
            String trangThai,
            LocalDateTime ngayXacNhan
    ) {}

    // DTO chi tiết đánh giá và kết quả
    public record KetQuaChiTietDTO(
            Long maQuaTrinh,
            String maSv,
            java.math.BigDecimal diemDoanhNghiep,
            String nhanXetDoanhNghiep,
            java.math.BigDecimal diemGiangVien,
            String nhanXetGiangVien,
            String ketQuaDoiSoat,
            String nhanXetDoiSoat,
            List<BaoCaoDTO> baoCao,
            String ketQuaCuoiCung,
            String trangThai,
            LocalDateTime ngayXacNhan
    ) {}

    public record BaoCaoDTO(
            Long maBaoCao,
            String tenBaoCao,
            String trangThai,
            LocalDateTime ngayNop
    ) {}

    public record XacNhanRequest(
            String ketQua
    ) {}

    // DTO danh sách kết quả dành cho sinh viên
    public record KetQuaSinhVienDTO(
            Long maQuaTrinh,
            Long maDangKy,
            String ketQua,
            String trangThai,
            LocalDateTime ngayXacNhan
    ) {}

    // =========================================
    // LẤY GIẢNG VIÊN ĐANG ĐĂNG NHẬP
    // =========================================

    private GiangVien getGiangVienDangNhap(
            Authentication authentication) {

        if (authentication == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Chưa đăng nhập"
            );
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản"
                ));

        return giangVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin giảng viên"
                ));
    }

    // =========================================
    // LẤY SINH VIÊN ĐANG ĐĂNG NHẬP
    // =========================================

    private SinhVien getSinhVienDangNhap(
            Authentication authentication) {

        if (authentication == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Chưa đăng nhập"
            );
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản"
                ));

        return sinhVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin sinh viên"
                ));
    }

    // =========================================
    // KIỂM TRA QUYỀN GIẢNG VIÊN VỚI QUÁ TRÌNH
    // =========================================

    private QuaTrinhThucTap kiemTraQuyen(
            Long maQuaTrinh,
            GiangVien giangVien) {

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy quá trình thực tập"
                ));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đăng ký thực tập"
                ));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không được phân công quản lý quá trình này"
            );
        }

        return quaTrinh;
    }

    // =========================================
    // KIỂM TRA ĐỦ HAI ĐÁNH GIÁ
    // =========================================

    private DanhGia getDanhGia(
            Long maQuaTrinh,
            String loaiDanhGia) {

        return danhGiaRepository
                .findByMaQuaTrinhAndLoaiDanhGia(
                        maQuaTrinh,
                        loaiDanhGia
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Chưa có đủ đánh giá của Doanh nghiệp và Giảng viên"
                ));
    }

    // =========================================
    // KIỂM TRA ĐỐI SOÁT
    // =========================================

    private DoiSoatDanhGia getDoiSoat(Long maQuaTrinh) {

        return doiSoatRepository
                .findByMaQuaTrinh(maQuaTrinh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Quá trình chưa được đối soát đánh giá"
                ));
    }

    // =========================================
    // KIỂM TRA BÁO CÁO ĐÃ DUYỆT
    // =========================================

    private List<BaoCao> kiemTraBaoCao(Long maQuaTrinh) {

        List<BaoCao> danhSach =
                baoCaoRepository.findByMaQuaTrinhOrderByNgayNopDesc(
                        maQuaTrinh
                );

        if (danhSach.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sinh viên chưa nộp báo cáo thực tập"
            );
        }

        boolean daDuyet = danhSach.stream()
                .anyMatch(b -> "DA_DUYET".equalsIgnoreCase(
                        b.getTrangThai()
                ));

        if (!daDuyet) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Báo cáo thực tập chưa được giảng viên duyệt"
            );
        }

        return danhSach;
    }

    // =========================================
    // 1. GIẢNG VIÊN XEM DANH SÁCH ĐỦ ĐIỀU KIỆN
    // =========================================

    public List<KetQuaDanhSachDTO> getDanhSach(
            Authentication authentication) {

        GiangVien giangVien = getGiangVienDangNhap(authentication);

        List<KetQuaDanhSachDTO> ketQua = new ArrayList<>();

        List<DangKyThucTap> danhSachDangKy =
                dangKyRepository.findByMaGv(giangVien.getMaGv());

        for (DangKyThucTap dangKy : danhSachDangKy) {

            Optional<QuaTrinhThucTap> optional =
                    quaTrinhRepository.findByMaDangKy(
                            dangKy.getMaDangKy()
                    );

            if (optional.isEmpty()) {
                continue;
            }

            QuaTrinhThucTap quaTrinh = optional.get();
            Long maQuaTrinh = quaTrinh.getMaQuaTrinh();

            if (!danhGiaRepository.existsByMaQuaTrinhAndLoaiDanhGia(
                    maQuaTrinh, "DOANH_NGHIEP")) {
                continue;
            }

            if (!danhGiaRepository.existsByMaQuaTrinhAndLoaiDanhGia(
                    maQuaTrinh, "GIANG_VIEN")) {
                continue;
            }

            if (!doiSoatRepository.existsByMaQuaTrinh(maQuaTrinh)) {
                continue;
            }

            if (baoCaoRepository
                    .findByMaQuaTrinhOrderByNgayNopDesc(maQuaTrinh)
                    .stream()
                    .noneMatch(b -> "DA_DUYET".equalsIgnoreCase(
                            b.getTrangThai()
                    ))) {
                continue;
            }

            Optional<KetQua> ketQuaDaCo =
                    ketQuaRepository.findByMaQuaTrinh(maQuaTrinh);

            ketQua.add(new KetQuaDanhSachDTO(
                    maQuaTrinh,
                    dangKy.getMaDangKy(),
                    dangKy.getMaSv(),
                    ketQuaDaCo.map(KetQua::getKetQua).orElse(null),
                    ketQuaDaCo.map(KetQua::getTrangThai)
                            .orElse("CHUA_XAC_NHAN"),
                    ketQuaDaCo.map(KetQua::getNgayXacNhan).orElse(null)
            ));
        }

        return ketQua;
    }

    // =========================================
    // 2. GIẢNG VIÊN XEM CHI TIẾT
    // =========================================

    public KetQuaChiTietDTO getChiTiet(
            Long maQuaTrinh,
            Authentication authentication) {

        GiangVien giangVien = getGiangVienDangNhap(authentication);

        kiemTraQuyen(maQuaTrinh, giangVien);

        DanhGia doanhNghiep =
                getDanhGia(maQuaTrinh, "DOANH_NGHIEP");

        DanhGia giangVienDanhGia =
                getDanhGia(maQuaTrinh, "GIANG_VIEN");

        DoiSoatDanhGia doiSoat = getDoiSoat(maQuaTrinh);

        List<BaoCaoDTO> baoCao = kiemTraBaoCao(maQuaTrinh)
                .stream()
                .map(b -> new BaoCaoDTO(
                        b.getMaBaoCao(),
                        b.getTenBaoCao(),
                        b.getTrangThai(),
                        b.getNgayNop()
                ))
                .toList();

        Optional<KetQua> ketQua =
                ketQuaRepository.findByMaQuaTrinh(maQuaTrinh);

        DangKyThucTap dangKy = dangKyRepository
                .findById(
                        quaTrinhRepository.findById(maQuaTrinh)
                                .orElseThrow().getMaDangKy()
                )
                .orElseThrow();

        return new KetQuaChiTietDTO(
                maQuaTrinh,
                dangKy.getMaSv(),
                doanhNghiep.getDiem(),
                doanhNghiep.getNoiDung(),
                giangVienDanhGia.getDiem(),
                giangVienDanhGia.getNoiDung(),
                doiSoat.getKetQua(),
                doiSoat.getNhanXet(),
                baoCao,
                ketQua.map(KetQua::getKetQua).orElse(null),
                ketQua.map(KetQua::getTrangThai)
                        .orElse("CHUA_XAC_NHAN"),
                ketQua.map(KetQua::getNgayXacNhan).orElse(null)
        );
    }

    // =========================================
    // 3. GIẢNG VIÊN XÁC NHẬN KẾT QUẢ CUỐI CÙNG
    // =========================================

    @Transactional
    public KetQua xacNhan(
            Long maQuaTrinh,
            String ketQuaCuoiCung,
            Authentication authentication) {

        GiangVien giangVien = getGiangVienDangNhap(authentication);

        kiemTraQuyen(maQuaTrinh, giangVien);

        getDanhGia(maQuaTrinh, "DOANH_NGHIEP");
        getDanhGia(maQuaTrinh, "GIANG_VIEN");
        getDoiSoat(maQuaTrinh);
        kiemTraBaoCao(maQuaTrinh);

        if (ketQuaCuoiCung == null
                || (!ketQuaCuoiCung.equals("DAT")
                && !ketQuaCuoiCung.equals("KHONG_DAT"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Kết quả chỉ được chọn DAT hoặc KHONG_DAT"
            );
        }

        if (ketQuaRepository.existsByMaQuaTrinh(maQuaTrinh)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Quá trình này đã được xác nhận kết quả"
            );
        }

        KetQua ketQua = new KetQua();
        ketQua.setMaQuaTrinh(maQuaTrinh);
        ketQua.setMaGv(giangVien.getMaGv());
        ketQua.setKetQua(ketQuaCuoiCung);
        ketQua.setTrangThai("DA_XAC_NHAN");
        ketQua.setNgayXacNhan(LocalDateTime.now());

        return ketQuaRepository.save(ketQua);
    }

    // =========================================
    // 4. SINH VIÊN XEM DANH SÁCH KẾT QUẢ CỦA MÌNH
    // =========================================

    public List<KetQuaSinhVienDTO> getKetQuaSinhVien(
            Authentication authentication) {

        SinhVien sinhVien = getSinhVienDangNhap(authentication);

        List<KetQuaSinhVienDTO> danhSach = new ArrayList<>();

        List<DangKyThucTap> danhSachDangKy =
                dangKyRepository.findByMaSv(sinhVien.getMaSv());

        for (DangKyThucTap dangKy : danhSachDangKy) {

            Optional<QuaTrinhThucTap> optional =
                    quaTrinhRepository.findByMaDangKy(
                            dangKy.getMaDangKy()
                    );

            if (optional.isEmpty()) {
                continue;
            }

            QuaTrinhThucTap quaTrinh = optional.get();

            Optional<KetQua> ketQua =
                    ketQuaRepository.findByMaQuaTrinh(
                            quaTrinh.getMaQuaTrinh()
                    );

            danhSach.add(new KetQuaSinhVienDTO(
                    quaTrinh.getMaQuaTrinh(),
                    dangKy.getMaDangKy(),
                    ketQua.map(KetQua::getKetQua).orElse(null),
                    ketQua.map(KetQua::getTrangThai)
                            .orElse("CHUA_XAC_NHAN"),
                    ketQua.map(KetQua::getNgayXacNhan).orElse(null)
            ));
        }

        return danhSach;
    }

    // =========================================
    // 5. SINH VIÊN XEM CHI TIẾT KẾT QUẢ CỦA MÌNH
    // =========================================

    public KetQuaChiTietDTO getChiTietSinhVien(
            Long maQuaTrinh,
            Authentication authentication) {

        SinhVien sinhVien = getSinhVienDangNhap(authentication);

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy quá trình thực tập"
                ));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đăng ký thực tập"
                ));

        // Kiểm tra quyền xem kết quả
        if (!sinhVien.getMaSv().equals(dangKy.getMaSv())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem kết quả này"
            );
        }

        // Lấy đánh giá doanh nghiệp nếu đã có
        Optional<DanhGia> doanhNghiep =
                danhGiaRepository.findByMaQuaTrinhAndLoaiDanhGia(
                        maQuaTrinh,
                        "DOANH_NGHIEP"
                );

        // Lấy đánh giá giảng viên nếu đã có
        Optional<DanhGia> giangVien =
                danhGiaRepository.findByMaQuaTrinhAndLoaiDanhGia(
                        maQuaTrinh,
                        "GIANG_VIEN"
                );

        // Lấy đối soát nếu đã có
        Optional<DoiSoatDanhGia> doiSoat =
                doiSoatRepository.findByMaQuaTrinh(maQuaTrinh);

        // Lấy danh sách báo cáo
        List<BaoCaoDTO> baoCao =
                baoCaoRepository
                        .findByMaQuaTrinhOrderByNgayNopDesc(maQuaTrinh)
                        .stream()
                        .map(b -> new BaoCaoDTO(
                                b.getMaBaoCao(),
                                b.getTenBaoCao(),
                                b.getTrangThai(),
                                b.getNgayNop()
                        ))
                        .toList();

        // Lấy kết quả cuối cùng
        Optional<KetQua> ketQua =
                ketQuaRepository.findByMaQuaTrinh(maQuaTrinh);

        return new KetQuaChiTietDTO(
                maQuaTrinh,
                sinhVien.getMaSv(),

                doanhNghiep.map(DanhGia::getDiem).orElse(null),
                doanhNghiep.map(DanhGia::getNoiDung).orElse(null),

                giangVien.map(DanhGia::getDiem).orElse(null),
                giangVien.map(DanhGia::getNoiDung).orElse(null),

                doiSoat.map(DoiSoatDanhGia::getKetQua).orElse(null),
                doiSoat.map(DoiSoatDanhGia::getNhanXet).orElse(null),

                baoCao,

                ketQua.map(KetQua::getKetQua).orElse(null),
                ketQua.map(KetQua::getTrangThai)
                        .orElse("CHUA_XAC_NHAN"),
                ketQua.map(KetQua::getNgayXacNhan).orElse(null)
        );
    }
}
