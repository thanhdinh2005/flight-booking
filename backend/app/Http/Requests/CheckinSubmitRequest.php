<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckinSubmitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ticket_id'      => 'required|integer|exists:tickets,id',
            'checkin_token'  => 'required|string', // Bắt buộc phải có token từ bước Verify
            'seat_number'    => [
                'required',
                'string',
                'regex:/^[0-9]{1,2}[A-F]$/'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'ticket_id.exists'      => 'Mã vé không tồn tại.',
            'checkin_token.required' => 'Phiên làm việc không hợp lệ (Thiếu token).',
            'seat_number.required'  => 'Vui lòng chọn chỗ ngồi.',
            'seat_number.regex'     => 'Định dạng số ghế không đúng (Ví dụ: 12A).',
        ];
    }
}