<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            InitialDataSeeder::class,
            UserSeeder::class,
            FlightScheduleSeeder::class,
            FlightInstanceSeeder::class,
           // FlightSeatInventorySeeder::class,
            BookingSeeder::class,
            PassengerSeeder::class,
            TicketSeeder::class,
            TicketAddonSeeder::class,
            BookingRequestSeeder::class,
            TransactionSeeder::class,
            AuditLogSeeder::class,
           
        ]);
    }
}