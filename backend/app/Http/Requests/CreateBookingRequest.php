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
            'contact_phone' => 'required|string|min:10|max:15',

            // Kiểm tra hành trình (Itinerary)
            'itinerary' => 'required|array|min:1',
            'itinerary.*.flight_instance_id' => 'required|exists:flight_instances,id',
            'itinerary.*.seat_class' => 'required|string|in:ECONOMY,BUSINESS,FIRST',

            // Kiểm tra danh sách hành khách
            'passengers' => 'required|array|min:1',
            'passengers.*.first_name' => 'required|string|max:50',
            'passengers.*.last_name' => 'required|string|max:50',
            'passengers.*.birthday' => 'required|date|before:today',
            'passengers.*.gender' => 'required|in:MALE,FEMALE,OTHER',
        ];
    }

    public function messages(): array
    {
        return [
            'itinerary.required' => 'Bạn phải chọn ít nhất một chuyến bay.',
            'itinerary.*.flight_instance_id.exists' => 'Chuyến bay không tồn tại trong hệ thống.',
            'passengers.required' => 'Vui lòng nhập thông tin hành khách.',
            'passengers.*.birthday.before' => 'Ngày sinh không hợp lệ.',
        ];
    }
}