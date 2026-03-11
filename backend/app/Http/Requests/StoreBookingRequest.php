<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Đổi thành true để cho phép thực hiện request này
        return true; 
    }

    public function rules(): array
    {
        return [
            // 1. Validate thông tin liên hệ & chuyến bay
            'contact_email'      => 'required|email|max:255', // Sửa lỗi chính tả "requrired"
            'contact_phone'      => 'required|string|max:20',
            'flight_instance_id' => 'required|exists:flight_instances,id',
            'seat_class'         => 'required|in:economy,business', // Nên đổi tên từ 'seats' thành 'seat_class' cho rõ nghĩa

            // 2. Validate danh sách hành khách
            'passengers'                         => 'required|array|min:1', 
            'passengers.*.first_name'            => 'required|string|max:50',
            'passengers.*.last_name'             => 'required|string|max:50',
            'passengers.*.gender'                => 'required|in:male,female,other',
            'passengers.*.date_of_birth'         => 'required|date|before:today',
            'passengers.*.id_number'             => 'nullable|string|max:20',
            'passengers.*.type'                  => 'required|in:adult,child,infant',

            // 3. Validate Dịch vụ bổ sung (Addons) cho từng hành khách
            'passengers.*.addons'                => 'nullable|array',
            'passengers.*.addons.*.addon_type'   => 'required|string|max:50',
            'passengers.*.addons.*.amount'       => 'required|numeric|min:0',
        ];
    }
}