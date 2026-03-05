<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchAirportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // 'q' là từ khóa tìm kiếm, không bắt buộc, nếu có thì phải là chuỗi
            'q' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z0-9\s]+$/u'],
        ];
    }
    public function messages(): array
    {
        return [
            'q.string' => 'Từ khóa tìm kiếm phải là dạng chuỗi.',
            'q.max' => 'Từ khóa tìm kiếm không được quá 50 ký tự.',
            'q.regex' => 'Từ khóa không được chứa các ký tự đặc biệt.',
        ];
    }
}