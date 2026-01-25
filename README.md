***** Tools Required: Herd, Docker, PhpStorm(Đếch có bản community chỉ có bản xịn nhưng cho free trial 30days), VSCode
***** Herd đã cài sẵn php, composer nên mỗi lần chạy backend phải mở herd
***** Command:
# composer install
***** Copy thủ công file .env.example sang file .env (ngang với file .env.example)
***** Thêm vào các thông số: 
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=flight-booking-realm

KEYCLOAK_CLIENT_ID=backend-client
KEYCLOAK_CLIENT_SECRET=PS7SDvDmdr0DB0lQ0ekDzCNdlwlcZvp4

KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin123

# php artisan key:generate
# php artisan migrate:fresh --seed

***** Chạy docker-compose sau đó vào http://localhost:8080 để tạo realm mới: import file realm-export.json