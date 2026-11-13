
package edu06.edu06.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
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

import edu06.edu06.entity.DangKyThucTap;
import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.entity.GiangVien;
import edu06.edu06.entity.MinhChung;
import edu06.edu06.entity.NhatKy;
import edu06.edu06.entity.QuaTrinhThucTap;
import edu06.edu06.entity.SinhVien;
import edu06.edu06.entity.TaiKhoan;
import edu06.edu06.entity.ViTriThucTap;
import edu06.edu06.repository.DangKyThucTapRepository;
import edu06.edu06.repository.DoanhNghiepRepository;
import edu06.edu06.repository.GiangVienRepository;
import edu06.edu06.repository.MinhChungRepository;
import edu06.edu06.repository.NhatKyRepository;
import edu06.edu06.repository.QuaTrinhThucTapRepository;
import edu06.edu06.repository.SinhVienRepository;
import edu06.edu06.repository.TaiKhoanRepository;
import edu06.edu06.repository.ViTriThucTapRepository;

@Service
@Transactional
public class MinhChungService {

    private final MinhChungRepository minhChungRepository;
    private final NhatKyRepository nhatKyRepository;
    private final QuaTrinhThucTapRepository quaTrinhRepository;
    private final DangKyThucTapRepository dangKyRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final DoanhNghiepRepository doanhNghiepRepository;
    private final ViTriThucTapRepository viTriThucTapRepository;

    private final Path thuMucLuuTru;

    private static final List<String> DINH_DANG_CHO_PHEP = List.of(
            "pdf", "png", "jpg", "jpeg",
            "doc", "docx", "xls", "xlsx"
    );

    public MinhChungService(
            MinhChungRepository minhChungRepository,
            NhatKyRepository nhatKyRepository,
            QuaTrinhThucTapRepository quaTrinhRepository,
            DangKyThucTapRepository dangKyRepository,
            TaiKhoanRepository taiKhoanRepository,
            SinhVienRepository sinhVienRepository,
            GiangVienRepository giangVienRepository,
            DoanhNghiepRepository doanhNghiepRepository,
            ViTriThucTapRepository viTriThucTapRepository,
            @Value("${app.upload.minh-chung-dir:uploads/minh-chung}")
            String duongDanLuuTru) {

        this.minhChungRepository = minhChungRepository;
        this.nhatKyRepository = nhatKyRepository;
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
                    "Không thể tạo thư mục lưu minh chứng!");
        }
    }

    // =====================================================
    // LẤY THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP
    // =====================================================

    private TaiKhoan layTaiKhoanDangNhap(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            throw new RuntimeException("Bạn chưa đăng nhập!");
        }

        return taiKhoanRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản!"));
    }

    // =====================================================
    // SINH VIÊN
    // =====================================================

    private SinhVien laySinhVienDangNhap(
            Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanDangNhap(authentication);

        return sinhVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ sinh viên!"));
    }

    // =====================================================
    // GIẢNG VIÊN
    // =====================================================

    private GiangVien layGiangVienDangNhap(
            Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanDangNhap(authentication);

        return giangVienRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ giảng viên!"));
    }

    // =====================================================
    // DOANH NGHIỆP
    // =====================================================

    private DoanhNghiep layDoanhNghiepDangNhap(
            Authentication authentication) {

        TaiKhoan taiKhoan = layTaiKhoanDangNhap(authentication);

        return doanhNghiepRepository
                .findByIdTaiKhoan(taiKhoan.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ doanh nghiệp!"));
    }

    // =====================================================
    // KIỂM TRA QUYỀN SINH VIÊN
    // =====================================================

    private NhatKy kiemTraQuyenTruyCap(
            Long maNhatKy,
            Authentication authentication) {

        SinhVien sinhVien = laySinhVienDangNhap(authentication);

        NhatKy nhatKy = nhatKyRepository.findById(maNhatKy)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhật ký!"));

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(nhatKy.getMaQuaTrinh())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy quá trình thực tập!"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đăng ký thực tập!"));

        if (!sinhVien.getMaSv().equals(dangKy.getMaSv())) {
            throw new RuntimeException(
                    "Bạn không có quyền truy cập nhật ký này!");
        }

        return nhatKy;
    }

    // =====================================================
    // KIỂM TRA QUYỀN GIẢNG VIÊN
    // =====================================================

    private NhatKy kiemTraQuyenGiangVien(
            Long maNhatKy,
            Authentication authentication) {

        GiangVien giangVien = layGiangVienDangNhap(authentication);

        NhatKy nhatKy = nhatKyRepository.findById(maNhatKy)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhật ký!"));

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(nhatKy.getMaQuaTrinh())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy quá trình thực tập!"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đăng ký thực tập!"));

        if (!giangVien.getMaGv().equals(dangKy.getMaGv())) {
            throw new RuntimeException(
                    "Bạn không có quyền xem minh chứng của sinh viên này!");
        }

        return nhatKy;
    }

    // =====================================================
    // KIỂM TRA QUYỀN DOANH NGHIỆP
    // =====================================================

    private NhatKy kiemTraQuyenDoanhNghiep(
            Long maNhatKy,
            Authentication authentication) {

        DoanhNghiep doanhNghiep = layDoanhNghiepDangNhap(authentication);

        NhatKy nhatKy = nhatKyRepository.findById(maNhatKy)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhật ký!"));

        QuaTrinhThucTap quaTrinh = quaTrinhRepository
                .findById(nhatKy.getMaQuaTrinh())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy quá trình thực tập!"));

        DangKyThucTap dangKy = dangKyRepository
                .findById(quaTrinh.getMaDangKy())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy đăng ký thực tập!"));

        ViTriThucTap viTri = viTriThucTapRepository
                .findById(dangKy.getMaViTri())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy vị trí thực tập!"));

        // Chỉ doanh nghiệp sở hữu vị trí thực tập mới được xem
        if (!doanhNghiep.getMaDn().equals(viTri.getMaDn())) {
            throw new RuntimeException(
                    "Bạn không có quyền xem nhật ký của sinh viên này!");
        }

        // Chỉ xem sinh viên đã được doanh nghiệp chấp nhận
        if (!"CHAP_NHAN".equals(dangKy.getTrangThaiDn())) {
            throw new RuntimeException(
                    "Sinh viên chưa được doanh nghiệp chấp nhận thực tập!");
        }

        return nhatKy;
    }

    // =====================================================
    // SINH VIÊN TẢI MINH CHỨNG LÊN
    // =====================================================

    public MinhChung taoMinhChung(
            Long maNhatKy,
            MultipartFile file,
            Authentication authentication) {

        kiemTraQuyenTruyCap(maNhatKy, authentication);

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn file minh chứng!");
        }

        String tenGoc = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename()
        );

        if (tenGoc.isBlank() || tenGoc.contains("..")) {
            throw new RuntimeException("Tên file không hợp lệ!");
        }

        String duoiFile = StringUtils.getFilenameExtension(tenGoc);

        if (duoiFile == null ||
                !DINH_DANG_CHO_PHEP.contains(duoiFile.toLowerCase())) {
            throw new RuntimeException(
                    "Chỉ chấp nhận PDF, ảnh PNG/JPG, Word và Excel!");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File không được vượt quá 10 MB!");
        }

        String tenFileMoi = UUID.randomUUID()
                + "." + duoiFile.toLowerCase();

        Path fileDich = thuMucLuuTru.resolve(tenFileMoi).normalize();

        if (!fileDich.startsWith(thuMucLuuTru)) {
            throw new RuntimeException("Đường dẫn file không hợp lệ!");
        }

        try {
            Files.copy(file.getInputStream(), fileDich);
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file minh chứng!");
        }

        try {
            MinhChung minhChung = new MinhChung();
            minhChung.setMaNhatKy(maNhatKy);
            minhChung.setTenFile(tenGoc);
            minhChung.setDuongDan(fileDich.toString());

            return minhChungRepository.save(minhChung);

        } catch (RuntimeException e) {
            try {
                Files.deleteIfExists(fileDich);
            } catch (IOException ignored) {
            }
            throw e;
        }
    }

    // =====================================================
    // SINH VIÊN XEM DANH SÁCH MINH CHỨNG
    // =====================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> danhSachTheoNhatKy(
            Long maNhatKy,
            Authentication authentication) {

        kiemTraQuyenTruyCap(maNhatKy, authentication);

        return chuyenDanhSach(
                minhChungRepository.findByMaNhatKyOrderByNgayNopDesc(maNhatKy)
        );
    }

    // =====================================================
    // GIẢNG VIÊN XEM DANH SÁCH MINH CHỨNG
    // =====================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> danhSachTheoNhatKyCuaGiangVien(
            Long maNhatKy,
            Authentication authentication) {

        kiemTraQuyenGiangVien(maNhatKy, authentication);

        return chuyenDanhSach(
                minhChungRepository.findByMaNhatKyOrderByNgayNopDesc(maNhatKy)
        );
    }

    // =====================================================
    // DOANH NGHIỆP XEM DANH SÁCH MINH CHỨNG
    // =====================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> danhSachTheoNhatKyCuaDoanhNghiep(
            Long maNhatKy,
            Authentication authentication) {

        kiemTraQuyenDoanhNghiep(maNhatKy, authentication);

        return chuyenDanhSach(
                minhChungRepository.findByMaNhatKyOrderByNgayNopDesc(maNhatKy)
        );
    }

    // =====================================================
    // CHUYỂN DANH SÁCH MINH CHỨNG THÀNH JSON
    // =====================================================

    private List<Map<String, Object>> chuyenDanhSach(
            List<MinhChung> danhSach) {

        List<Map<String, Object>> ketQua = new ArrayList<>();

        for (MinhChung item : danhSach) {
            ketQua.add(chuyenDoiThongTin(item));
        }

        return ketQua;
    }

    // =====================================================
    // KIỂM TRA MINH CHỨNG CỦA SINH VIÊN
    // =====================================================

    private MinhChung kiemTraMinhChung(
            Long maMinhChung,
            Authentication authentication) {

        MinhChung minhChung = minhChungRepository.findById(maMinhChung)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy minh chứng!"));

        kiemTraQuyenTruyCap(minhChung.getMaNhatKy(), authentication);

        return minhChung;
    }

    // =====================================================
    // KIỂM TRA MINH CHỨNG CỦA GIẢNG VIÊN
    // =====================================================

    private MinhChung kiemTraMinhChungCuaGiangVien(
            Long maMinhChung,
            Authentication authentication) {

        MinhChung minhChung = minhChungRepository.findById(maMinhChung)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy minh chứng!"));

        kiemTraQuyenGiangVien(minhChung.getMaNhatKy(), authentication);

        return minhChung;
    }

    // =====================================================
    // KIỂM TRA MINH CHỨNG CỦA DOANH NGHIỆP
    // =====================================================

    private MinhChung kiemTraMinhChungCuaDoanhNghiep(
            Long maMinhChung,
            Authentication authentication) {

        MinhChung minhChung = minhChungRepository.findById(maMinhChung)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy minh chứng!"));

        kiemTraQuyenDoanhNghiep(minhChung.getMaNhatKy(), authentication);

        return minhChung;
    }

    // =====================================================
    // SINH VIÊN XEM CHI TIẾT MINH CHỨNG
    // =====================================================

    @Transactional(readOnly = true)
    public Map<String, Object> chiTiet(
            Long maMinhChung,
            Authentication authentication) {

        return chuyenDoiThongTin(
                kiemTraMinhChung(maMinhChung, authentication)
        );
    }

    // =====================================================
    // GIẢNG VIÊN XEM CHI TIẾT MINH CHỨNG
    // =====================================================

    @Transactional(readOnly = true)
    public Map<String, Object> chiTietCuaGiangVien(
            Long maMinhChung,
            Authentication authentication) {

        return chuyenDoiThongTin(
                kiemTraMinhChungCuaGiangVien(maMinhChung, authentication)
        );
    }

    // =====================================================
    // DOANH NGHIỆP XEM CHI TIẾT MINH CHỨNG
    // =====================================================

    @Transactional(readOnly = true)
    public Map<String, Object> chiTietCuaDoanhNghiep(
            Long maMinhChung,
            Authentication authentication) {

        return chuyenDoiThongTin(
                kiemTraMinhChungCuaDoanhNghiep(
                        maMinhChung, authentication
                )
        );
    }

    // =====================================================
    // SINH VIÊN TẢI FILE
    // =====================================================

    @Transactional(readOnly = true)
    public Resource taiFile(
            Long maMinhChung,
            Authentication authentication) {

        return layResource(
                kiemTraMinhChung(maMinhChung, authentication)
        );
    }

    // =====================================================
    // GIẢNG VIÊN TẢI FILE
    // =====================================================

    @Transactional(readOnly = true)
    public Resource taiFileCuaGiangVien(
            Long maMinhChung,
            Authentication authentication) {

        return layResource(
                kiemTraMinhChungCuaGiangVien(
                        maMinhChung, authentication
                )
        );
    }

    // =====================================================
    // DOANH NGHIỆP TẢI FILE
    // =====================================================

    @Transactional(readOnly = true)
    public Resource taiFileCuaDoanhNghiep(
            Long maMinhChung,
            Authentication authentication) {

        return layResource(
                kiemTraMinhChungCuaDoanhNghiep(
                        maMinhChung, authentication
                )
        );
    }

    // =====================================================
    // ĐỌC FILE TỪ MÁY CHỦ
    // =====================================================

    private Resource layResource(MinhChung minhChung) {

        try {
            Path duongDan = Paths.get(minhChung.getDuongDan())
                    .toAbsolutePath()
                    .normalize();

            if (!Files.exists(duongDan) ||
                    !Files.isRegularFile(duongDan)) {
                throw new RuntimeException(
                        "File minh chứng không tồn tại trên máy chủ!");
            }

            Resource resource = new UrlResource(duongDan.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException(
                        "Không thể đọc file minh chứng!");
            }

            return resource;

        } catch (IOException e) {
            throw new RuntimeException("Không thể tải file minh chứng!");
        }
    }

    // =====================================================
    // SINH VIÊN XÓA MINH CHỨNG
    // =====================================================

    public void xoaMinhChung(
            Long maMinhChung,
            Authentication authentication) {

        MinhChung minhChung = kiemTraMinhChung(
                maMinhChung, authentication
        );

        Path duongDan = Paths.get(minhChung.getDuongDan());

        minhChungRepository.delete(minhChung);

        try {
            Files.deleteIfExists(duongDan);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Đã xóa dữ liệu minh chứng nhưng chưa xóa được file trên máy chủ!");
        }
    }

    // =====================================================
    // CHUYỂN THÔNG TIN MINH CHỨNG THÀNH JSON
    // =====================================================

    private Map<String, Object> chuyenDoiThongTin(
            MinhChung minhChung) {

        Map<String, Object> item = new java.util.HashMap<>();

        item.put("maMinhChung", minhChung.getMaMinhChung());
        item.put("maNhatKy", minhChung.getMaNhatKy());
        item.put("tenFile", minhChung.getTenFile());
        item.put("ngayNop", minhChung.getNgayNop());

        item.put(
                "duongDanTai",
                "/api/minh-chung/"
                        + minhChung.getMaMinhChung()
                        + "/tai-xuong"
        );

        return item;
    }
}
