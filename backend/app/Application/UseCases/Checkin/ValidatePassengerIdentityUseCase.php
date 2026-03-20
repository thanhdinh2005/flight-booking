<?php
namespace App\Application\UseCases\Checkin;

use App\Models\Ticket;
use Exception;
use Carbon\Carbon;

class ValidatePassengerIdentityUseCase{
    public function execute(int $ticketId, array $data)
    {
        // 1. Tìm vé kèm thông tin hành khách (Passenger)
        $ticket = Ticket::with('passenger')->findOrFail($ticketId);
        $passenger = $ticket->passenger;

        if (!$passenger) {
            throw new Exception("Không tìm thấy thông tin hành khách gắn liền với vé này.");
        }

        // 2. Chuẩn hóa dữ liệu để so sánh (Viết hoa, xóa khoảng trắng thừa)
        $inputFirstName = strtoupper(trim($data['first_name']));
        $inputLastName  = strtoupper(trim($data['last_name']));
        $inputIdNumber  = trim($data['id_number']);
        $inputDob       = Carbon::parse($data['date_of_birth'])->format('Y-m-d');

        // 3. Thực hiện đối soát (Strict Matching)
        $isMatch = (
            strtoupper($passenger->first_name) === $inputFirstName &&
            strtoupper($passenger->last_name) === $inputLastName &&
            $passenger->id_number === $inputIdNumber &&
            Carbon::parse($passenger->date_of_birth)->format('Y-m-d') === $inputDob
        );

        if (!$isMatch) {
            throw new Exception("Thông tin định danh không khớp với dữ liệu đăng ký. Vui lòng kiểm tra lại.");
        }

        // 4. Kiểm tra trạng thái vé (Tránh check-in vé đã dùng hoặc đã hủy)
        if (!in_array($ticket->status, ['PAID', 'ISSUED'])) {
            throw new Exception("Trạng thái vé không hợp lệ để thực hiện xác thực.");
        }

        return true;
    }
}