
package edu06.edu06.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.TaiKhoanRepository;

@Service
public class DoanhNghiepService {

    private final DoanhNghiepRepository doanhNghiepRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    public DoanhNghiepService(
            DoanhNghiepRepository doanhNghiepRepository,
            TaiKhoanRepository taiKhoanRepository) {
        this.doanhNghiepRepository = doanhNghiepRepository;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    private DoanhNghiep layDoanhNghiepHienTai(
            Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }

        String username = authentication.getName();

        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản"));

        return doanhNghiepRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tài khoản chưa có hồ sơ doanh nghiệp"));
    }

    public DoanhNghiep layHoSo(Authentication authentication) {
        return layDoanhNghiepHienTai(authentication);
    }

    @Transactional
    public DoanhNghiep capNhatHoSo(
            DoanhNghiep thongTin,
            Authentication authentication) {

        DoanhNghiep doanhNghiep =
                layDoanhNghiepHienTai(authentication);

        doanhNghiep.setTenDn(thongTin.getTenDn());
        doanhNghiep.setEmail(thongTin.getEmail());
        doanhNghiep.setDiaChi(thongTin.getDiaChi());
        doanhNghiep.setSoDienThoai(thongTin.getSoDienThoai());

        return doanhNghiepRepository.save(doanhNghiep);
    }
}
