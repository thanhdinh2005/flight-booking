<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Passenger extends Model
{
    protected $fillable = [
        'first_name', 
        'last_name', 
        'gender', 
        'date_of_birth', 
        'id_number', 
        'type'
    ];

    public function tickets() 
    {
        return $this->hasMany(Ticket::class);
    }
}