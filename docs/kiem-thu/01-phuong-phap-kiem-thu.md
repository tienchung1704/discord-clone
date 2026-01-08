# PHƯƠNG PHÁP VÀ CÔNG CỤ KIỂM THỬ

## 1. Phương pháp kiểm thử

### 1.1. Kiểm thử hộp đen (Black-box Testing)
- Kiểm thử chức năng dựa trên đặc tả yêu cầu
- Không quan tâm đến cấu trúc code bên trong
- Tập trung vào input/output của hệ thống

### 1.2. Kiểm thử hộp trắng (White-box Testing)
- Kiểm thử dựa trên cấu trúc code
- Kiểm tra các nhánh điều kiện, vòng lặp
- Đảm bảo độ phủ code (code coverage)

### 1.3. Kiểm thử đơn vị (Unit Testing)
- Kiểm thử từng component/function riêng lẻ
- Sử dụng Vitest framework
- Mock các dependencies

### 1.4. Kiểm thử tích hợp (Integration Testing)
- Kiểm thử tương tác giữa các module
- Kiểm thử API endpoints
- Kiểm thử database operations

## 2. Công cụ kiểm thử

| STT | Công cụ | Mục đích |
|-----|---------|----------|
| 1 | Vitest | Unit testing framework |
| 2 | React Testing Library | Component testing |
| 3 | Postman | API testing |
| 4 | Chrome DevTools | Frontend debugging |
| 5 | Prisma Studio | Database testing |

## 3. Môi trường kiểm thử

- **Development**: localhost:3000
- **Database**: MySQL (PlanetScale)
- **Authentication**: Clerk (test mode)
- **File Storage**: UploadThing (test bucket)
