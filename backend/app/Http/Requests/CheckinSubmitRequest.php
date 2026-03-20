<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckinSubmitRequest extends FormRequest
{
    /**
     * Cho phép mọi user truy cập luồng check-in.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Các quy tắc validate cho việc chọn ghế.
     */
    public function rules(): array
    {
        return [
            'ticket_id'   => 'required|integer|exists:tickets,id',
            'seat_number' => [
                'required',
                'string',
                'regex:/^[0-9]{1,2}[A-F]$/' // Chặn định dạng sai ngay lập tức (VD: 12A, 5F là đúng)
            ],
        ];
    }

    /**
     * Thông báo lỗi tùy chỉnh.
     */
    public function messages(): array
    {
        return [
            'ticket_id.exists'      => 'Mã vé không hợp lệ.',
            'seat_number.required'  => 'Bạn chưa chọn chỗ ngồi trên máy bay.',
            'seat_number.regex'     => 'Định dạng số ghế không hợp lệ (Ví dụ đúng: 1A, 15F).',
        ];
    }
}