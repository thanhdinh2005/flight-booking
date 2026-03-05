<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketAddonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tickets = DB::table('tickets')->get();

        foreach ($tickets as $ticket) {

            DB::table('ticket_addons')->insert([
                'ticket_id' => $ticket->id,
                'addon_type' => 'BAGGAGE_20KG',
                'amount' => 200000,
                'created_at' => now(),
            ]);
        }
    }
}
