Hướng dẫn setup BE:
1. Yêu cầu hệ thống:
Cài đặt trước Herd (PHP và Composer), Docker desktop.
Kiểm tra bằng:
php -v
composer -v
docker -v

2. Setup Backend:
# B1: Di chuyển vào thư mục backend
cd backend

# B2: Cài dependency:
composer install

# B3: Cấu hình file .env
- Tạo file .env ngang cấp với file .env.example
- Copy toàn bộ nội dung của file .env.example sang file .env vừa tạo
- Mở file .env thêm vào cuối:
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=flight-booking-realm

KEYCLOAK_CLIENT_ID=backend-client
KEYCLOAK_CLIENT_SECRET=PS7SDvDmdr0DB0lQ0ekDzCNdlwlcZvp4

KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin123

- Chạy file docker-compose.yml bằng extension của VSC hoặc command: docker-compose up -d 
- Kiểm tra với: docker ps

- Cấu hình Keycloak:
+ Truy cập: http://localhost:8080
+ Đăng nhập: Username: admin, Password: admin123
+ Gần logo của Keycloak có dropdown show các realm, chọn create realm. Sau đó ta import file /keycloak/realm-export.json

- Khởi tạo laravel:
php artisan key:generate
php artisan config:clear
php artisan migrate:fresh --seed

- Truy cập Backend tại: http://backend.test/api
- Ví dụ: GET http://backend.test/api/test

- Xem dữ liệu database bằng adminer tại: http://localhost:8083
- Nhập thông tin đăng nhập:
| Field    | Value          |
| -------- | -------------- |
| System   | PostgreSQL     |
| Server   | postgres       |
| Username | postgres       |
| Password | secret         |
| Database | flight_booking |
