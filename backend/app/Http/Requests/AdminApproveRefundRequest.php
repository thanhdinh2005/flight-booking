<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminApproveRefundRequest extends FormRequest
{
    /**
     * Xác định xem người dùng có quyền thực hiện request này không.
     */
    public function authorize(): bool
    {
        // Bạn có thể kiểm tra quyền Admin ở đây nếu chưa dùng Middleware
        return true; 
    }

    /**
     * Các quy tắc kiểm tra dữ liệu (Validation Rules).
     */
    public function rules(): array
    {
        return [
            // Số tiền hoàn là bắt buộc, phải là số, tối thiểu là 0
            'final_amount' => 'required|numeric|min:0',
            
            // Ghi chú của nhân viên có thể để trống nhưng không nên quá dài
            'staff_note'   => 'nullable|string|max:500',
        ];
    }

    /**
     * Tùy chỉnh thông báo lỗi (Messages).
     */
    public function messages(): array
    {
        return [
            'final_amount.required' => 'Vui lòng nhập số tiền hoàn thực tế.',
            'final_amount.numeric'  => 'Số tiền hoàn phải là định dạng số.',
            'final_amount.min'      => 'Số tiền hoàn không được là số âm.',
            'staff_note.max'        => 'Ghi chú không được vượt quá 500 ký tự.',
        ];
    }
}