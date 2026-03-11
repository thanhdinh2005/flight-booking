<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $addons = [
            // Dịch vụ Hành lý
            ['name' => 'Hành lý ký gửi 15kg', 'code' => 'BAG15', 'type' => 'LUGGAGE', 'price' => 180000],
            ['name' => 'Hành lý ký gửi 23kg', 'code' => 'BAG23', 'type' => 'LUGGAGE', 'price' => 250000],
            ['name' => 'Hành lý ký gửi 32kg', 'code' => 'BAG32', 'type' => 'LUGGAGE', 'price' => 450000],

            // Dịch vụ Suất ăn
            ['name' => 'Cơm gà Hội An', 'code' => 'MEAL_CHICKEN', 'type' => 'MEAL', 'price' => 85000],
            ['name' => 'Mì Ý sốt bò bằm', 'code' => 'MEAL_PASTA', 'type' => 'MEAL', 'price' => 95000],
            ['name' => 'Suất ăn chay đặc biệt', 'code' => 'MEAL_VEG', 'type' => 'MEAL', 'price' => 80000],

            // Dịch vụ khác
            ['name' => 'Ưu tiên làm thủ tục', 'code' => 'PRIORITY', 'type' => 'SERVICE', 'price' => 120000],
            ['name' => 'Phòng chờ thương gia', 'code' => 'LOUNGE', 'type' => 'SERVICE', 'price' => 450000],
        ];

        foreach ($addons as $addon) {
            DB::table('addons')->updateOrInsert(['code' => $addon['code']], $addon);
        }
    }
}
