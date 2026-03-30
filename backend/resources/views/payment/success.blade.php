@extends('layouts.app') @section('content')
<div class="container mx-auto mt-10 max-w-2xl">
    <div class="bg-white p-8 rounded-lg shadow-md border-t-4 border-green-500 text-center">
        <div class="text-green-500 text-6xl mb-4">
            <i class="fas fa-check-circle"></i>
        </div>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
        <p class="text-gray-600 mb-6">Cảm ơn bạn đã sử dụng dịch vụ. Vé điện tử đã được gửi về email <b>{{ $booking->contact_email }}</b>.</p>

        <div class="bg-gray-50 p-4 rounded text-left mb-6">
            <h3 class="text-xl font-semibold border-b pb-2 mb-4">Chi tiết mã đặt chỗ</h3>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Mã đặt chỗ (PNR)</p>
                    <p class="text-2xl font-bold text-blue-600">{{ $booking->pnr }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Tổng tiền đã thanh toán</p>
                    <p class="text-xl font-bold text-red-500">{{ number_format($booking->total_amount, 0, ',', '.') }} VNĐ</p>
                </div>
            </div>

            @foreach($booking->tickets as $ticket)
            <div class="mt-4 pt-4 border-t border-dashed">
                <p class="font-semibold text-gray-700">
                    ✈️ Hành khách: {{ $ticket->passenger->last_name }} {{ $ticket->passenger->first_name }}
                </p>
                <p class="text-sm text-gray-600">
                    Chuyến bay: {{ $ticket->flight_instance->flight_schedule->flight_number }} 
                    | Khởi hành: {{ \Carbon\Carbon::parse($ticket->flight_instance->std)->format('d/m/Y H:i') }}
                </p>
            </div>
            @endforeach
        </div>

    </div>
</div>
@endsection