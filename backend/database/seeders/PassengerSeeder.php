<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PassengerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xóa dữ liệu cũ để tránh trùng lặp nếu chạy lại seeder
        DB::table('passengers')->delete();

        DB::table('passengers')->insert([
            [
                'first_name' => 'AN',
                'last_name' => 'NGUYEN VAN',
                'gender' => 'male',
                'date_of_birth' => '1995-05-20',
                'id_number' => '012345678901', // CCCD cho người lớn
                'type' => 'adult',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'HOA',
                'last_name' => 'LE THI',
                'gender' => 'female',
                'date_of_birth' => '1990-01-01',
                'id_number' => '001122334455',
                'type' => 'adult',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'BINH',
                'last_name' => 'NGUYEN LE',
                'gender' => 'male',
                'date_of_birth' => '2018-10-15',
                'id_number' => null, // Trẻ em có thể chưa có CCCD
                'type' => 'child',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}