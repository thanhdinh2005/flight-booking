<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddonBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
{
    return [
        // 1. Kiểm tra vé
        'ticket_id' => 'required|integer|exists:tickets,id',
        
        // 2. Đổi từ addon_code sang addon_id để khớp với Command
        'addon_id' => [
            'required',
            'integer',
            'exists:addons,id' // Check trực tiếp theo ID cho nhanh
        ],

        // 3. Quantity: Cho phép tối thiểu là 0 
        // (Vì logic Command của bạn có xử lý quantity = 0 để xóa addon)
        'quantity' => [
            'required',
            'integer',
            'min:0', 
            'max:10'
        ]
    ];
}

public function messages(): array
{
    return [
        'ticket_id.exists' => 'Không tìm thấy thông tin vé yêu cầu.',
        'addon_id.exists'  => 'Dịch vụ bổ sung không tồn tại.',
        'quantity.min'     => 'Số lượng không được nhỏ hơn 0.',
        'quantity.max'     => 'Số lượng vượt quá giới hạn cho phép.',
    ];
}
}