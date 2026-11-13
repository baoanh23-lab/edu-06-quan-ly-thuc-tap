
package edu06.edu06.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import edu06.edu06.entity.BaoCao;
import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.entity.ViTriThucTap;
import edu06.edu06.repository.BaoCaoRepository;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
@Transactional
public class BaoCaoService {

    private final BaoCaoRepository baoCaoRepository;
    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;
    private final ViTriThucTapRepository viTriThucTapRepository;

    private final Path thuMucLuuTru;

    private static final List<String> DINH_DANG_CHO_PHEP =
            List.of("pdf", "doc", "docx");

    public BaoCaoService(
            BaoCaoRepository baoCaoRepository,
            QuaTrinhThucTapRepository quaTrinhRepository,
            DangKyThucTapRepository dangKyRepository,
            TaiKhoanRepository taiKhoanRepository,
            SinhVienRepository sinhVienRepository,
            GiangVienRepository giangVienRepository,
            DoanhNghiepRepository doanhNghiepRepository,
            ViTriThucTapRepository viTriThucTapRepository,
            @Value("${app.upload.bao-cao-dir:uploads/bao-cao}")
            String duongDanLuuTru) {

        this.baoCaoRepository = baoCaoRepository;
        this.quaTrinhRepository = quaTrinhRepository;
        this.dangKyRepository = dangKyRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.giangVienRepository = giangVienRepository;
        this.doanhNghiepRepository = doanhNghiepRepository;
        this.viTriThucTapRepository = viTriThucTapRepository;

        this.thuMucLuuTru = Paths.get(duongDanLuuTru)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.thuMucLuuTru);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Không thể tạo thư mục lưu báo cáo!"
            );
        }
    }

    // ==========================================
    // LẤY TÀI KHOẢN ĐANG ĐĂNG NHẬP
    // ==========================================

    private TaiKhoan layTaiKhoanDangNhap(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        return taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy tài khoản!"
                        ));
    }

    // ==========================================
    // KIỂM TRA QUYỀN TRUY CẬP QUÁ TRÌNH
    // SINH VIÊN - GIẢNG VIÊN - DOANH NGHIỆP
    // ==========================================

    private QuaTrinhThucTap kiemTraQuyenTruyCapQuaTrinh(
            Long maQuaTrinh,
            Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanDangNhap(authentication);

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(maQuaTrinh)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy quá trình thực tập!"
                        ));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy đăng ký thực tập!"
                        ));

        // --------------------------------------
        // SINH VIÊN
        // --------------------------------------

        boolean laSinhVien = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_SINH_VIEN".equals(
                                authority.getAuthority()
                        ));

        if (laSinhVien) {

            SinhVien sinhVien = sinhVienRepository
                    .findByIdTaiKhoan(taiKhoan.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Không tìm thấy hồ sơ sinh viên!"
                            ));

            if (!sinhVien.getMaSv().equals(dangKy.getMaSv())) {
                throw new RuntimeException(
                        "Bạn không có quyền truy cập báo cáo này!"
                );
            }

            return quaTrinh;
        }

        // --------------------------------------
        // GIẢNG VIÊN
        // --------------------------------------

        boolean laGiangVien = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_GIANG_VIEN".equals(
                                authority.getAuthority()
                        ));

        if (laGiangVien) {

            GiangVien giangVien = giangVienRepository
                    .findByIdTaiKhoan(taiKhoan.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Không tìm thấy hồ sơ giảng viên!"
                            ));

            if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
                throw new RuntimeException(
                        "Bạn không có quyền xem báo cáo của sinh viên này!"
                );
            }

            return quaTrinh;
        }

        // --------------------------------------
        // DOANH NGHIỆP
        // --------------------------------------

        boolean laDoanhNghiep = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_DOANH_NGHIEP".equals(
                                authority.getAuthority()
                        ));

        if (laDoanhNghiep) {

            DoanhNghiep doanhNghiep = doanhNghiepRepository
                    .findByIdTaiKhoan(taiKhoan.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Không tìm thấy hồ sơ doanh nghiệp!"
                            ));

            ViTriThucTap viTri = viTriThucTapRepository
                    .findById(dangKy.getMaViTri())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Không tìm thấy vị trí thực tập!"
                            ));

            // Kiểm tra vị trí thực tập thuộc doanh nghiệp đăng nhập
            if (!doanhNghiep.getMaDn().equals(viTri.getMaDn())) {
                throw new RuntimeException(
                        "Bạn không có quyền xem báo cáo của sinh viên này!"
                );
            }

            // Chỉ xem sinh viên đã được doanh nghiệp tiếp nhận
            if (!"CHAP_NHAN".equals(dangKy.getTrangThaiDn())) {
                throw new RuntimeException(
                        "Sinh viên chưa được doanh nghiệp tiếp nhận!"
                );
            }

            return quaTrinh;
        }

        throw new RuntimeException(
                "Bạn không có quyền truy cập chức năng này!"
        );
    }

    // ==========================================
    // KIỂM TRA QUYỀN TRUY CẬP BÁO CÁO
    // ==========================================

    private BaoCao kiemTraQuyenTruyCapBaoCao(
            Long maBaoCao,
            Authentication authentication) {

        BaoCao baoCao = baoCaoRepository
                .findById(maBaoCao)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy báo cáo!"
                        ));

        kiemTraQuyenTruyCapQuaTrinh(
                baoCao.getMaQuaTrinh(),
                authentication
        );

        return baoCao;
    }

    // ==========================================
    // SINH VIÊN NỘP BÁO CÁO
    // ==========================================

    public BaoCao taoBaoCao(
            Long maQuaTrinh,
            String tenBaoCao,
            MultipartFile file,
            Authentication authentication) {

        boolean laSinhVien = authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_SINH_VIEN".equals(
                                authority.getAuthority()
                        ));

        if (!laSinhVien) {
            throw new RuntimeException(
                    "Chỉ sinh viên mới được nộp báo cáo!"
            );
        }

        kiemTraQuyenTruyCapQuaTrinh(
                maQuaTrinh,
                authentication
        );

        if (tenBaoCao == null || tenBaoCao.isBlank()) {
            throw new RuntimeException(
                    "Vui lòng nhập tên báo cáo!"
            );
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "Vui lòng chọn file báo cáo!"
            );
        }

        String tenGoc = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename()
        );

        if (tenGoc.isBlank() || tenGoc.contains("..")) {
            throw new RuntimeException(
                    "Tên file không hợp lệ!"
            );
        }

        String duoiFile =
                StringUtils.getFilenameExtension(tenGoc);

        if (duoiFile == null
                || !DINH_DANG_CHO_PHEP.contains(
                        duoiFile.toLowerCase())) {

            throw new RuntimeException(
                    "Chỉ chấp nhận file PDF, Word DOC hoặc DOCX!"
            );
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException(
                    "File báo cáo không được vượt quá 10 MB!"
            );
        }

        String tenFileMoi = UUID.randomUUID()
                + "." + duoiFile.toLowerCase();

        Path fileDich = thuMucLuuTru
                .resolve(tenFileMoi)
                .normalize();

        if (!fileDich.startsWith(thuMucLuuTru)) {
            throw new RuntimeException(
                    "Đường dẫn file không hợp lệ!"
            );
        }

        try {
            Files.copy(file.getInputStream(), fileDich);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Không thể lưu file báo cáo!"
            );
        }

        try {
            BaoCao baoCao = new BaoCao();

            baoCao.setMaQuaTrinh(maQuaTrinh);
            baoCao.setTenBaoCao(tenBaoCao.trim());
            baoCao.setDuongDan(fileDich.toString());
            baoCao.setTrangThai("CHO_DUYET");

            return baoCaoRepository.save(baoCao);

        } catch (RuntimeException e) {

            try {
                Files.deleteIfExists(fileDich);
            } catch (IOException ignored) {
            }

            throw e;
        }
    }

    // ==========================================
    // XEM DANH SÁCH BÁO CÁO THEO QUÁ TRÌNH
    // ==========================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> danhSachTheoQuaTrinh(
            Long maQuaTrinh,
            Authentication authentication) {

        kiemTraQuyenTruyCapQuaTrinh(
                maQuaTrinh,
                authentication
        );

        List<BaoCao> danhSach =
                baoCaoRepository.findByMaQuaTrinhOrderByNgayNopDesc(
                        maQuaTrinh
                );

        List<Map<String, Object>> ketQua = new ArrayList<>();

        for (BaoCao baoCao : danhSach) {
            ketQua.add(chuyenDoiThongTin(baoCao));
        }

        return ketQua;
    }

    // ==========================================
    // XEM CHI TIẾT BÁO CÁO
    // ==========================================

    @Transactional(readOnly = true)
    public Map<String, Object> chiTiet(
            Long maBaoCao,
            Authentication authentication) {

        BaoCao baoCao = kiemTraQuyenTruyCapBaoCao(
                maBaoCao,
                authentication
        );

        return chuyenDoiThongTin(baoCao);
    }

    // ==========================================
    // TẢI FILE BÁO CÁO
    // ==========================================

    @Transactional(readOnly = true)
    public Resource taiFile(
            Long maBaoCao,
            Authentication authentication) {

        BaoCao baoCao = kiemTraQuyenTruyCapBaoCao(
                maBaoCao,
                authentication
        );

        try {
            Path duongDan = Paths.get(baoCao.getDuongDan())
                    .toAbsolutePath()
                    .normalize();

            if (!Files.exists(duongDan)
                    || !Files.isRegularFile(duongDan)) {

                throw new RuntimeException(
                        "File báo cáo không tồn tại trên máy chủ!"
                );
            }

            Resource resource = new UrlResource(duongDan.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException(
                        "Không thể đọc file báo cáo!"
                );
            }

            return resource;

        } catch (IOException e) {
            throw new RuntimeException(
                    "Không thể tải file báo cáo!"
            );
        }
    }

    // ==========================================
    // SINH VIÊN XÓA BÁO CÁO
    // ==========================================

    public void xoaBaoCao(
            Long maBaoCao,
            Authentication authentication) {

        boolean laSinhVien = authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_SINH_VIEN".equals(
                                authority.getAuthority()
                        ));

        if (!laSinhVien) {
            throw new RuntimeException(
                    "Chỉ sinh viên mới được xóa báo cáo!"
            );
        }

        BaoCao baoCao = kiemTraQuyenTruyCapBaoCao(
                maBaoCao,
                authentication
        );

        String trangThai = baoCao.getTrangThai();

        if (!"CHO_DUYET".equals(trangThai)
                && !"TU_CHOI".equals(trangThai)) {

            throw new RuntimeException(
                    "Chỉ được xóa báo cáo đang chờ duyệt hoặc đã bị từ chối!"
            );
        }

        Path duongDan = Paths.get(baoCao.getDuongDan());

        baoCaoRepository.delete(baoCao);

        try {
            Files.deleteIfExists(duongDan);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Đã xóa dữ liệu báo cáo nhưng chưa xóa được file trên máy chủ!"
            );
        }
    }

    // ==========================================
    // KIỂM TRA QUYỀN GIẢNG VIÊN XỬ LÝ BÁO CÁO
    // ==========================================

    private void kiemTraLaGiangVien(
            Authentication authentication) {

        boolean laGiangVien = authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_GIANG_VIEN".equals(
                                authority.getAuthority()
                        ));

        if (!laGiangVien) {
            throw new RuntimeException(
                    "Chỉ giảng viên mới được duyệt hoặc từ chối báo cáo!"
            );
        }
    }

    // ==========================================
    // GIẢNG VIÊN DUYỆT BÁO CÁO
    // ==========================================

    public Map<String, Object> duyetBaoCao(
            Long maBaoCao,
            Authentication authentication) {

        kiemTraLaGiangVien(authentication);

        BaoCao baoCao = kiemTraQuyenTruyCapBaoCao(
                maBaoCao,
                authentication
        );

        if (!"CHO_DUYET".equals(baoCao.getTrangThai())) {
            throw new RuntimeException(
                    "Báo cáo này không còn ở trạng thái chờ duyệt!"
            );
        }

        baoCao.setTrangThai("DA_DUYET");

        BaoCao saved = baoCaoRepository.save(baoCao);

        Map<String, Object> result = chuyenDoiThongTin(saved);
        result.put("message", "Duyệt báo cáo thực tập thành công!");

        return result;
    }

    // ==========================================
    // GIẢNG VIÊN TỪ CHỐI BÁO CÁO
    // ==========================================

    public Map<String, Object> tuChoiBaoCao(
            Long maBaoCao,
            Authentication authentication) {

        kiemTraLaGiangVien(authentication);

        BaoCao baoCao = kiemTraQuyenTruyCapBaoCao(
                maBaoCao,
                authentication
        );

        if (!"CHO_DUYET".equals(baoCao.getTrangThai())) {
            throw new RuntimeException(
                    "Báo cáo này không còn ở trạng thái chờ duyệt!"
            );
        }

        baoCao.setTrangThai("TU_CHOI");

        BaoCao saved = baoCaoRepository.save(baoCao);

        Map<String, Object> result = chuyenDoiThongTin(saved);
        result.put("message", "Từ chối báo cáo thực tập thành công!");

        return result;
    }

    // ==========================================
    // CHUYỂN THÔNG TIN BÁO CÁO THÀNH MAP
    // ==========================================

    private Map<String, Object> chuyenDoiThongTin(
            BaoCao baoCao) {

        Map<String, Object> item = new HashMap<>();

        item.put("maBaoCao", baoCao.getMaBaoCao());
        item.put("maQuaTrinh", baoCao.getMaQuaTrinh());
        item.put("tenBaoCao", baoCao.getTenBaoCao());
        item.put("ngayNop", baoCao.getNgayNop());
        item.put("trangThai", baoCao.getTrangThai());

        item.put(
                "duongDanTai",
                "/api/bao-cao/"
                        + baoCao.getMaBaoCao()
                        + "/tai-xuong"
        );

        return item;
    }
}
