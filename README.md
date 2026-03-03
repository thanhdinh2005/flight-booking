Hướng dẫn setup BE:
1. Tool: Herd (bao gồm PHP và Composer), Docker desktop
2. Cài dependency bằng lệnh(nhớ cd backend): composer install
3. Cấu hình env:
B1: tạo file .env
B2: Copy từ file .env.example sang .env (File .env cùng cấp file .env.example)
B3: Thêm cấu hình keycloak vào .env

KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=flight-booking-realm

KEYCLOAK_CLIENT_ID=backend-client
KEYCLOAK_CLIENT_SECRET=PS7SDvDmdr0DB0lQ0ekDzCNdlwlcZvp4

KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
B4: tạo file database.sqlite trong thư mục /database
B5 Khởi tạo Laravel:
php artisan key:generate
php artisan migrate:fresh --seed

B6: chạy file docker-compose.yml (bằng dòng lệnh hoặc extension VSC)

- Truy cập; http://localhost:8080

- Đăng nhập bằng:
Username: admin
Password: admin123

- Tạo realm mới bằng cách import file keycloak/realm-export.json

# Backend do đã cài Herd nên tự động export ra url: http://backend.test/api, mọi request đều trả về Json.