<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckinVerifyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Cho phép mọi user truy cập (vì check-in thường không cần đăng nhập)
    }

    public function rules(): array
    {
        return [
            'ticket_id'     => 'required|integer|exists:tickets,id',
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'id_number'     => 'required|string|max:50',
            'date_of_birth' => 'required|date|before:today',
        ];
    }

    public function messages(): array
    {
        return [
            'ticket_id.exists'      => 'Mã vé không tồn tại trong hệ thống.',
            'date_of_birth.before'  => 'Ngày sinh phải là một ngày trong quá khứ.',
            'id_number.required'    => 'Vui lòng nhập số CCCD hoặc Hộ chiếu.',
        ];
    }
}
