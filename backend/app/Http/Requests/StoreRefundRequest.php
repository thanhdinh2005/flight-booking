<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Để true để test, sau này check auth()
    }

    public function rules(): array
    {
        return [
            // Khách chọn danh sách ID vé muốn hoàn
            'ticket_id' => 'required|int|min:1',
            'ticket_id.*' => 'required|exists:tickets,id',
            // Lý do hoàn vé
            'reason' => 'required|string|min:10|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'ticket_id.required' => 'Bạn chưa chọn vé nào để hoàn tiền.',
            'ticket_id.*.exists' => 'Một trong các vé được chọn không tồn tại.',
            'reason.required' => 'Vui lòng cung cấp lý do hoàn vé.',
            'reason.min' => 'Lý do hoàn vé cần chi tiết hơn (tối thiểu 10 ký tự).',
        ];
    }
}