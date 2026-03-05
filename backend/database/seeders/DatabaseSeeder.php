<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::create([
            'keycloak_id' => 'admin-keycloak-uuid-001',
            'email' => 'admin@example.com',
            'full_name' => 'Admin User',
            'role' => 'admin',
            'phone_number' => '0901234567',
            'status' => 'active',
        ]);

        User::create([
            'keycloak_id' => 'user-keycloak-uuid-002',
            'email' => 'test@example.com',
            'full_name' => 'Test User',
            'role' => 'user',
            'phone_number' => '0909876543',
            'status' => 'active',
        ]);
    }
}