<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    

    // Khai báo các cột có thể fill data nhanh
    protected $fillable = [
        'name',
        'code',
        'type',
        'price',
        'description',
        'is_active'
    ];

    /**
     * Scope để chỉ lấy các dịch vụ đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
