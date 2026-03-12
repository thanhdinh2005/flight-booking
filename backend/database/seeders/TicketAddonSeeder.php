<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketAddonSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Lấy thông tin addon từ bảng danh mục trước
        $baggageAddon = DB::table('addons')->where('code', 'BAG15')->first();

        if (!$baggageAddon) {
            $this->command->error("Chưa có dữ liệu mẫu trong bảng addons. Hãy chạy AddonSeeder trước!");
            return;
        }

        $tickets = DB::table('tickets')->get();

        foreach ($tickets as $ticket) {
            // Giả sử mỗi vé mẫu chúng ta tặng kèm 1 kiện hành lý
            DB::table('ticket_addons')->insert([
                'ticket_id' => $ticket->id,
                'addon_id'  => $baggageAddon->id, // TRUYỀN ID (SỐ), KHÔNG TRUYỀN CODE (CHỮ)
                'quantity'  => 1,                 // THÊM SỐ LƯỢNG
                'amount'    => $baggageAddon->price, // LẤY GIÁ TỪ BẢNG ADDONS LUÔN CHO CHUẨN
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}