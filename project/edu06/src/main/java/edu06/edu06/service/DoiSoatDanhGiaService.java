
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

import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DanhGia;
import edu06.edu06.entity.DoiSoatDanhGia;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DanhGiaRepository;
import edu06.edu06.repository.DoiSoatDanhGiaRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.TaiKhoanRepository;

@Service
public class DoiSoatDanhGiaService {

    private final DoiSoatDanhGiaRepository doiSoatRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final GiangVienRepository giangVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    public DoiSoatDanhGiaService(
            DoiSoatDanhGiaRepository doiSoatRepository,
            DanhGiaRepository danhGiaRepository,
            QuaTrinhThucTapRepository quaTrinhRepository,
            DangKyThucTapRepository dangKyRepository,
            GiangVienRepository giangVienRepository,
            TaiKhoanRepository taiKhoanRepository) {

        this.doiSoatRepository = doiSoatRepository;
        this.danhGiaRepository = danhGiaRepository;
        this.quaTrinhRepository = quaTrinhRepository;
        this.dangKyRepository = dangKyRepository;
        this.giangVienRepository = giangVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    // DTO danh sách quá trình đủ điều kiện đối soát
    public record DanhSachDoiSoatDTO(
            Long maQuaTrinh,
            Long maDangKy,
            String maSv,
            String tenSinhVien,
            String trangThaiDoiSoat,
            LocalDateTime ngayDoiSoat
    ) {}

    // DTO thông tin chi tiết hai đánh giá
    public record ChiTietDoiSoatDTO(
            Long maQuaTrinh,
            String maSv,
            String tenSinhVien,

            java.math.BigDecimal diemDoanhNghiep,
            String nhanXetDoanhNghiep,

            java.math.BigDecimal diemGiangVien,
            String nhanXetGiangVien,

            Long maDoiSoat,
            String ketQua,
            String nhanXetDoiSoat,
            LocalDateTime ngayDoiSoat
    ) {}

    // Lấy giảng viên đang đăng nhập
    private GiangVien getGiangVienDangNhap(Authentication authentication) {

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

    // Kiểm tra quá trình có thuộc giảng viên đang đăng nhập không
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

    // Kiểm tra đã có đủ hai đánh giá chưa
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
                        "Quá trình chưa có đủ đánh giá của hai bên"
                ));
    }

    // 1. Danh sách quá trình đã có đủ hai đánh giá
    public List<DanhSachDoiSoatDTO> getDanhSach(Authentication authentication) {

        GiangVien giangVien = getGiangVienDangNhap(authentication);

        List<DanhSachDoiSoatDTO> ketQua = new ArrayList<>();

        List<DangKyThucTap> danhSachDangKy =
                dangKyRepository.findByMaGv(giangVien.getMaGv());

        for (DangKyThucTap dangKy : danhSachDangKy) {

            Optional<QuaTrinhThucTap> optionalQuaTrinh =
                    quaTrinhRepository.findByMaDangKy(
                            dangKy.getMaDangKy()
                    );

            if (optionalQuaTrinh.isEmpty()) {
                continue;
            }

            QuaTrinhThucTap quaTrinh = optionalQuaTrinh.get();

            Optional<DanhGia> danhGiaDoanhNghiep =
                    danhGiaRepository.findByMaQuaTrinhAndLoaiDanhGia(
                            quaTrinh.getMaQuaTrinh(),
                            "DOANH_NGHIEP"
                    );

            Optional<DanhGia> danhGiaGiangVien =
                    danhGiaRepository.findByMaQuaTrinhAndLoaiDanhGia(
                            quaTrinh.getMaQuaTrinh(),
                            "GIANG_VIEN"
                    );

            // Chỉ hiển thị khi cả hai bên đã đánh giá
            if (danhGiaDoanhNghiep.isEmpty()
                    || danhGiaGiangVien.isEmpty()) {
                continue;
            }

            Optional<DoiSoatDanhGia> doiSoat =
                    doiSoatRepository.findByMaQuaTrinh(
                            quaTrinh.getMaQuaTrinh()
                    );

            ketQua.add(new DanhSachDoiSoatDTO(
                    quaTrinh.getMaQuaTrinh(),
                    quaTrinh.getMaDangKy(),
                    dangKy.getMaSv(),
                    null,
                    doiSoat.map(DoiSoatDanhGia::getKetQua)
                            .orElse("CHUA_DOI_SOAT"),
                    doiSoat.map(DoiSoatDanhGia::getNgayDoiSoat)
                            .orElse(null)
            ));
        }

        return ketQua;
    }

    // 2. Xem chi tiết hai đánh giá và kết quả đối soát
    public ChiTietDoiSoatDTO getChiTiet(
            Long maQuaTrinh,
            Authentication authentication) {

        GiangVien giangVien = getGiangVienDangNhap(authentication);

        QuaTrinhThucTap quaTrinh =
                kiemTraQuyen(maQuaTrinh, giangVien);

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đăng ký thực tập"
                ));

        DanhGia danhGiaDoanhNghiep =
                getDanhGia(maQuaTrinh, "DOANH_NGHIEP");

        DanhGia danhGiaGiangVien =
                getDanhGia(maQuaTrinh, "GIANG_VIEN");

        Optional<DoiSoatDanhGia> doiSoat =
                doiSoatRepository.findByMaQuaTrinh(maQuaTrinh);

        return new ChiTietDoiSoatDTO(
                maQuaTrinh,
                dangKy.getMaSv(),
                null,

                danhGiaDoanhNghiep.getDiem(),
                danhGiaDoanhNghiep.getNoiDung(),

                danhGiaGiangVien.getDiem(),
                danhGiaGiangVien.getNoiDung(),

                doiSoat.map(DoiSoatDanhGia::getMaDoiSoat)
                        .orElse(null),

                doiSoat.map(DoiSoatDanhGia::getKetQua)
                        .orElse(null),

                doiSoat.map(DoiSoatDanhGia::getNhanXet)
                        .orElse(null),

                doiSoat.map(DoiSoatDanhGia::getNgayDoiSoat)
                        .orElse(null)
        );
    }

    // 3. Tạo kết quả đối soát
    @Transactional
    public DoiSoatDanhGia taoDoiSoat(
            Long maQuaTrinh,
            String ketQua,
            String nhanXet,
            Authentication authentication) {

        GiangVien giangVien = getGiangVienDangNhap(authentication);

        kiemTraQuyen(maQuaTrinh, giangVien);

        // Bắt buộc có đủ hai đánh giá
        getDanhGia(maQuaTrinh, "DOANH_NGHIEP");
        getDanhGia(maQuaTrinh, "GIANG_VIEN");

        if (ketQua == null || ketQua.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập kết quả đối soát"
            );
        }

        if (ketQua.trim().length() > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Kết quả đối soát không được vượt quá 50 ký tự"
            );
        }

        // Mỗi quá trình chỉ được đối soát một lần
        if (doiSoatRepository.existsByMaQuaTrinh(maQuaTrinh)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Quá trình này đã được đối soát"
            );
        }

        DoiSoatDanhGia doiSoat = new DoiSoatDanhGia();

        doiSoat.setMaQuaTrinh(maQuaTrinh);
        doiSoat.setMaGv(giangVien.getMaGv());
        doiSoat.setKetQua(ketQua.trim());
        doiSoat.setNhanXet(nhanXet);
        doiSoat.setNgayDoiSoat(LocalDateTime.now());

        return doiSoatRepository.save(doiSoat);
    }
}
