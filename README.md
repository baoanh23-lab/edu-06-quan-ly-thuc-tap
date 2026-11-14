# CỔNG QUẢN LÝ THỰC TẬP VÀ ĐÁNH GIÁ DOANH NGHIỆP (EDU-06)

## 1. Giới thiệu dự án

**EDU-06 – Cổng quản lý thực tập và đánh giá doanh nghiệp** là hệ thống hỗ trợ quản lý quá trình thực tập của sinh viên, giúp kết nối và hỗ trợ trao đổi thông tin giữa ba đối tượng: Sinh viên, Giảng viên hướng dẫn và Doanh nghiệp tiếp nhận thực tập.

Hệ thống được xây dựng nhằm hỗ trợ đăng ký thực tập, theo dõi quá trình thực tập, quản lý nhật ký, minh chứng, báo cáo thực tập và thực hiện đánh giá kết quả thực tập.

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Java – Spring Boot |
| Frontend | ReactJS |
| Cơ sở dữ liệu | Microsoft SQL Server |
| Xác thực và phân quyền | Spring Security, JWT |
| Mã hóa mật khẩu | BCrypt |
| Giao tiếp giữa Frontend và Backend | REST API |

## 3. Các chức năng chính

### 3.1. Sinh viên
- Đăng nhập và quản lý thông tin tài khoản cá nhân.
- Đăng ký giảng viên hướng dẫn.
- Tìm kiếm và đăng ký vị trí thực tập.
- Theo dõi trạng thái đăng ký thực tập.
- Theo dõi quá trình thực tập.
- Quản lý nhật ký thực tập.
- Quản lý minh chứng thực tập.
- Nộp và theo dõi trạng thái báo cáo thực tập.
- Xem kết quả đánh giá thực tập.

### 3.2. Giảng viên hướng dẫn
- Quản lý thông tin cá nhân.
- Theo dõi danh sách sinh viên được hướng dẫn.
- Theo dõi quá trình thực tập của sinh viên.
- Xem nhật ký và minh chứng thực tập.
- Xem báo cáo thực tập.
- Đánh giá kết quả thực tập của sinh viên.
- Xác nhận kết quả thực tập.

### 3.3. Doanh nghiệp
- Quản lý thông tin doanh nghiệp.
- Quản lý các vị trí thực tập.
- Tiếp nhận và xử lý đăng ký thực tập của sinh viên.
- Theo dõi sinh viên đang thực tập tại doanh nghiệp.
- Theo dõi nhật ký và minh chứng thực tập.
- Đánh giá quá trình thực tập của sinh viên.
- Xác nhận kết quả thực tập theo quy trình của hệ thống.

## 4. Cấu trúc repository

Repository được tổ chức thành các thư mục chính:

- `project/`: Chứa mã nguồn dự án.
- `sql/`: Chứa các tập tin SQL phục vụ việc tạo và quản lý cơ sở dữ liệu.
- `SoDo/`: Chứa các sơ đồ, hình ảnh và tài liệu minh họa của dự án.

Ngoài ra, repository có thể bao gồm tài liệu báo cáo và các tài nguyên liên quan đến quá trình thực hiện đề tài.

## 5. Hướng dẫn cài đặt và chạy chương trình

### 5.1. Yêu cầu môi trường

Cần chuẩn bị các công cụ sau:

- JDK phù hợp với phiên bản Spring Boot của dự án.
- Node.js và npm.
- Microsoft SQL Server.
- SQL Server Management Studio (SSMS).
- Visual Studio Code hoặc IntelliJ IDEA.

### 5.2. Tải mã nguồn

Sử dụng lệnh sau để tải dự án về máy:

```bash
git clone https://github.com/baoanh23-lab/edu-06-quan-ly-thuc-tap.git
```

Sau đó mở thư mục dự án bằng Visual Studio Code hoặc IDE phù hợp.

### 5.3. Cấu hình cơ sở dữ liệu

1. Mở SQL Server và kết nối đến máy chủ cơ sở dữ liệu.
2. Truy cập thư mục `sql/` trong repository.
3. Thực thi các tập tin SQL theo thứ tự phù hợp để tạo cơ sở dữ liệu và dữ liệu cần thiết.
4. Cấu hình thông tin kết nối SQL Server trong phần cấu hình Backend.
5. Không đưa mật khẩu hoặc thông tin kết nối cá nhân lên GitHub.

### 5.4. Chạy Backend

1. Mở thư mục chứa mã nguồn Backend.
2. Kiểm tra và cấu hình kết nối cơ sở dữ liệu.
3. Khởi chạy ứng dụng Spring Boot bằng IDE hoặc Maven.

Nếu dự án sử dụng Maven Wrapper, có thể chạy:

```bash
mvnw spring-boot:run
```

Trên macOS/Linux:

```bash
./mvnw spring-boot:run
```

### 5.5. Chạy Frontend

1. Mở thư mục chứa mã nguồn Frontend.
2. Cài đặt các thư viện cần thiết:

```bash
npm install
```

3. Khởi chạy ứng dụng:

```bash
npm run dev
```

Nếu dự án sử dụng lệnh khởi chạy khác, thực hiện theo cấu hình trong `package.json`.

## 6. Repository dự án

**GitHub:**  
https://github.com/baoanh23-lab/edu-06-quan-ly-thuc-tap

Repository chứa mã nguồn và các tài nguyên phục vụ cho việc xây dựng, triển khai và tìm hiểu dự án.

## 7. Tác giả và thông tin học phần

- **Tên đề tài:** Cổng quản lý thực tập và đánh giá doanh nghiệp.
- **Mã đề tài:** EDU-06.
- **Học phần:** OOSD_CNPM1.
- **Ngôn ngữ:** JavaScript, Java, SQL.
- **Mục đích:** Xây dựng hệ thống hỗ trợ quản lý hoạt động thực tập và đánh giá kết quả thực tập giữa sinh viên, giảng viên hướng dẫn và doanh nghiệp.
