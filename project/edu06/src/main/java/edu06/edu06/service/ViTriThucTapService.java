
package edu06.edu06.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import edu06.edu06.dto.ViTriThucTapResponse;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
public class ViTriThucTapService {

    private final ViTriThucTapRepository viTriThucTapRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;

    public ViTriThucTapService(
            ViTriThucTapRepository viTriThucTapRepository,
            TaiKhoanRepository taiKhoanRepository,
            DoanhNghiepRepository doanhNghiepRepository) {

        this.viTriThucTapRepository = viTriThucTapRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.doanhNghiepRepository = doanhNghiepRepository;
    }

    // Lấy danh sách vị trí thực tập phù hợp theo chuyên ngành
    public List<ViTriThucTapResponse> layViTriPhuHop(
            String maChuyenNganh) {

        List<Object[]> ketQua =
                viTriThucTapRepository.findViTriPhuHop(maChuyenNganh);

        return ketQua.stream().map(row ->
                new ViTriThucTapResponse(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        (String) row[4],
                        (String) row[5],
                        (String) row[6],
                        ((Number) row[7]).intValue(),
                        (String) row[8]
                )
        ).toList();
    }

    // Đếm tổng số vị trí thực tập của doanh nghiệp đang đăng nhập
    public long demViTriCuaDoanhNghiep(String username) {

        // Tìm tài khoản theo username
        TaiKhoan taiKhoan = taiKhoanRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));

        // Tìm hồ sơ doanh nghiệp theo tài khoản
        DoanhNghiep doanhNghiep = doanhNghiepRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ doanh nghiệp!"));

        // Đếm số vị trí thuộc doanh nghiệp
        return viTriThucTapRepository.findAll()
                .stream()
                .filter(viTri ->
                        Objects.equals(
                                doanhNghiep.getMaDn(),
                                viTri.getMaDn()
                        )
                )
                .count();
    }
}
