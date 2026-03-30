@extends('layouts.app')

@section('content')
<div class="container mx-auto mt-10 max-w-xl">
    <div class="bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500 text-center">
        <div class="text-red-500 text-6xl mb-4">
            <i class="fas fa-times-circle"></i>
        </div>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Giao dịch không thành công</h2>
        
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{{ $message }}</p>
        </div>

        <p class="text-gray-600 mb-6">Vui lòng kiểm tra lại số dư thẻ hoặc thử lại với phương thức thanh toán khác.</p>

    </div>
</div>
@endsection