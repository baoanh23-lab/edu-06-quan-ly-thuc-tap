package edu06.edu06.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.dto.ViTriThucTapDTO;
import edu06.edu06.entity.ChuyenNganh;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.entity.ViTriChuyenNganh;
import edu06.edu06.entity.ViTriThucTap;
import edu06.edu06.repository.ChuyenNganhRepository;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriChuyenNganhRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
public class DoanhNghiepViTriService {

    private final ViTriThucTapRepository viTriRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final ChuyenNganhRepository chuyenNganhRepository;
    private final ViTriChuyenNganhRepository viTriChuyenNganhRepository;

    public DoanhNghiepViTriService(
            ViTriThucTapRepository viTriRepository,
            DangKyThucTapRepository dangKyRepository,
            DoanhNghiepRepository doanhNghiepRepository,
            TaiKhoanRepository taiKhoanRepository,
            ChuyenNganhRepository chuyenNganhRepository,
            ViTriChuyenNganhRepository viTriChuyenNganhRepository) {

        this.viTriRepository = viTriRepository;
        this.dangKyRepository = dangKyRepository;
        this.doanhNghiepRepository = doanhNghiepRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.chuyenNganhRepository = chuyenNganhRepository;
        this.viTriChuyenNganhRepository = viTriChuyenNganhRepository;
    }

    // Lấy doanh nghiệp đang đăng nhập
    private DoanhNghiep layDoanhNghiepHienTai(
            Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản"));

        return doanhNghiepRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tài khoản chưa có hồ sơ doanh nghiệp"));
    }

    // Chuyển dữ liệu vị trí sang DTO
    private ViTriThucTapDTO chuyenSangDTO(ViTriThucTap viTri) {

        ViTriThucTapDTO dto = new ViTriThucTapDTO();

        dto.setMaViTri(viTri.getMaViTri());
        dto.setMaDn(viTri.getMaDn());
        dto.setTenViTri(viTri.getTenViTri());
        dto.setMoTa(viTri.getMoTa());
        dto.setYeuCau(viTri.getYeuCau());
        dto.setSoLuong(viTri.getSoLuong());
        dto.setTrangThai(viTri.getTrangThai());

        List<ViTriChuyenNganh> danhSachLienKet =
                viTriChuyenNganhRepository
                        .findByIdMaViTri(viTri.getMaViTri());

        List<String> maChuyenNganhs = new ArrayList<>();
        List<String> tenChuyenNganhs = new ArrayList<>();

        for (ViTriChuyenNganh lienKet : danhSachLienKet) {

            String maChuyenNganh =
                    lienKet.getId().getMaChuyenNganh();

            chuyenNganhRepository.findById(maChuyenNganh)
                    .ifPresent(chuyenNganh -> {
                        maChuyenNganhs.add(
                                chuyenNganh.getMaChuyenNganh());

                        tenChuyenNganhs.add(
                                chuyenNganh.getTenChuyenNganh());
                    });
        }

        dto.setMaChuyenNganhs(maChuyenNganhs);
        dto.setTenChuyenNganhs(tenChuyenNganhs);

        return dto;
    }

    // Kiểm tra và lưu danh sách chuyên ngành cho vị trí
    private void luuChuyenNganh(
            Long maViTri,
            List<String> danhSachMaChuyenNganh) {

        if (danhSachMaChuyenNganh == null
                || danhSachMaChuyenNganh.isEmpty()) {
            throw new RuntimeException(
                    "Vui lòng chọn ít nhất một chuyên ngành");
        }

        // Xóa các liên kết cũ
        viTriChuyenNganhRepository.deleteByIdMaViTri(maViTri);

        // Lưu các liên kết mới
        for (String ma : danhSachMaChuyenNganh) {

            if (ma == null || ma.isBlank()) {
                continue;
            }

            ChuyenNganh chuyenNganh = chuyenNganhRepository
                    .findById(ma)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Không tìm thấy chuyên ngành: " + ma));

            ViTriChuyenNganh lienKet =
                    new ViTriChuyenNganh(
                            maViTri,
                            chuyenNganh.getMaChuyenNganh());

            viTriChuyenNganhRepository.save(lienKet);
        }
    }

    // 1. Lấy danh sách vị trí của doanh nghiệp
    public List<ViTriThucTapDTO> layDanhSach(
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepHienTai(authentication);

        List<ViTriThucTap> danhSach =
                viTriRepository.findByMaDn(doanhNghiep.getMaDn());

        return danhSach.stream()
                .map(this::chuyenSangDTO)
                .toList();
    }

    // 2. Thêm vị trí thực tập
    @Transactional
    public ViTriThucTapDTO themViTri(
            ViTriThucTapDTO thongTin,
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepHienTai(authentication);

        if (thongTin.getTenViTri() == null
                || thongTin.getTenViTri().isBlank()) {
            throw new RuntimeException(
                    "Tên vị trí không được để trống");
        }

        if (thongTin.getSoLuong() == null
                || thongTin.getSoLuong() <= 0) {
            throw new RuntimeException(
                    "Số lượng phải lớn hơn 0");
        }

        ViTriThucTap viTri = new ViTriThucTap();

        viTri.setMaDn(doanhNghiep.getMaDn());
        viTri.setTenViTri(thongTin.getTenViTri());
        viTri.setMoTa(thongTin.getMoTa());
        viTri.setYeuCau(thongTin.getYeuCau());
        viTri.setSoLuong(thongTin.getSoLuong());
        viTri.setTrangThai("DANG_MO");

        ViTriThucTap viTriDaLuu =
                viTriRepository.save(viTri);

        luuChuyenNganh(
                viTriDaLuu.getMaViTri(),
                thongTin.getMaChuyenNganhs());

        return chuyenSangDTO(viTriDaLuu);
    }

    // 3. Cập nhật vị trí
    @Transactional
    public ViTriThucTapDTO capNhatViTri(
            Long maViTri,
            ViTriThucTapDTO thongTin,
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepHienTai(authentication);

        ViTriThucTap viTri = viTriRepository
                .findByMaViTriAndMaDn(
                        maViTri, doanhNghiep.getMaDn())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy vị trí thực tập"));

        if (thongTin.getTenViTri() == null
                || thongTin.getTenViTri().isBlank()) {
            throw new RuntimeException(
                    "Tên vị trí không được để trống");
        }

        if (thongTin.getSoLuong() == null
                || thongTin.getSoLuong() <= 0) {
            throw new RuntimeException(
                    "Số lượng phải lớn hơn 0");
        }

        viTri.setTenViTri(thongTin.getTenViTri());
        viTri.setMoTa(thongTin.getMoTa());
        viTri.setYeuCau(thongTin.getYeuCau());
        viTri.setSoLuong(thongTin.getSoLuong());

        ViTriThucTap viTriDaLuu =
                viTriRepository.save(viTri);

        luuChuyenNganh(
                maViTri,
                thongTin.getMaChuyenNganhs());

        return chuyenSangDTO(viTriDaLuu);
    }

    // 4. Đóng hoặc mở lại vị trí
    @Transactional
    public ViTriThucTap capNhatTrangThai(
            Long maViTri,
            String trangThai,
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepHienTai(authentication);

        if (!"DANG_MO".equals(trangThai)
                && !"DA_DONG".equals(trangThai)) {
            throw new RuntimeException(
                    "Trạng thái không hợp lệ");
        }

        ViTriThucTap viTri = viTriRepository
                .findByMaViTriAndMaDn(
                        maViTri, doanhNghiep.getMaDn())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy vị trí thực tập"));

        viTri.setTrangThai(trangThai);

        return viTriRepository.save(viTri);
    }

    // 5. Xóa vị trí nếu chưa có sinh viên đăng ký
    @Transactional
    public void xoaViTri(
            Long maViTri,
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepHienTai(authentication);

        ViTriThucTap viTri = viTriRepository
                .findByMaViTriAndMaDn(
                        maViTri, doanhNghiep.getMaDn())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy vị trí thực tập"));

        if (dangKyRepository.existsByMaViTri(maViTri)) {
            throw new RuntimeException(
                    "Không thể xóa vì đã có sinh viên đăng ký vị trí này");
        }

        // Xóa liên kết chuyên ngành trước
        viTriChuyenNganhRepository.deleteByIdMaViTri(maViTri);

        viTriRepository.delete(viTri);
    }
}