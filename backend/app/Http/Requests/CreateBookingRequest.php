<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
{
    return [
        // Thông tin liên lạc
        'contact_email' => 'required|email',
        // Số điện thoại: chỉ số, tối đa 10 ký tự
        'contact_phone' => 'required|regex:/^[0-9]{10}$/',

        // Kiểm tra hành trình (Itinerary)
        'itinerary' => 'required|array|min:1',
        'itinerary.*.flight_instance_id' => 'required|exists:flight_instances,id',
        'itinerary.*.seat_class' => 'required|string|in:ECONOMY,BUSINESS,FIRST',

        // Kiểm tra danh sách hành khách
        'passengers' => 'required|array|min:1',
        // Họ tên: không dấu, chỉ chữ cái A–Z
        'passengers.*.first_name' => [
    'required',
    'regex:/^[A-Z ]+$/i', // Cho phép chữ cái A–Z và khoảng trắng
    'max:50'
],
'passengers.*.last_name' => [
    'required',
    'regex:/^[A-Z ]+$/i', // Cho phép chữ cái A–Z và khoảng trắng
    'max:50'
],
        // Ngày sinh: phải đủ 18 tuổi
        'passengers.*.date_of_birth' => 'required|date|before_or_equal:' . now()->subYears(18)->toDateString(),
        'passengers.*.gender' => 'required|in:MALE,FEMALE,OTHER',
        'passengers.*.id_number' => 'required|string|max:20',
        'passengers.*.type' => 'nullable|string|in:ADULT,CHILD,INFANT',
    ];
}

    public function messages(): array
    {
        return [
            'itinerary.required' => 'Bạn phải chọn ít nhất một chuyến bay.',
            'itinerary.*.flight_instance_id.exists' => 'Chuyến bay không tồn tại trong hệ thống.',
            'passengers.required' => 'Vui lòng nhập thông tin hành khách.',
            'passengers.*.date_of_birth.before' => 'Ngày sinh không hợp lệ.',
            'passengers.*.id_number.required' => 'Số CCCD/Hộ chiếu của hành khách là bắt buộc.',
            'passengers.*.id_number.max' => 'Số định danh không được vượt quá 20 ký tự.',
        ];
    }
}