<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'user_id', 'bus_route_id', 'travel_date',
        'passenger_name', 'gender', 'email', 'nic',
        'board_stop_index', 'alight_stop_index',
        'payment_method', 'status', 'booking_reference',
        'bus_number'
    ];
    protected $casts = ['travel_date' => 'date'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($booking) {
            $booking->booking_reference = strtoupper(Str::random(6));
        });
    }

    public function user()     { return $this->belongsTo(User::class); }
    public function busRoute() { return $this->belongsTo(BusRoute::class); }
    public function seats()    { return $this->hasMany(BookingSeat::class); }

    public function seatNumbers(): array
    {
        return $this->seats->pluck('seat_number')->toArray();
    }
}