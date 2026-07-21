<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusRoute extends Model
{
    protected $table = 'bus_routes';

    protected $fillable = [
        'bus_number', 'from_location', 'to_location', 'departure_time',
        'arrival_time', 'total_seats', 'price', 'is_active', 'route_template_id'
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function routeTemplate()
    {
        return $this->belongsTo(BusRouteTemplate::class, 'route_template_id');
    }

    public function driverAssignment()
    {
        return $this->hasOne(DriverAssignment::class);
    }

    public function location()
    {
        return $this->hasOne(BusLocation::class);
    }

    public function bookedSeatsOnDate(string $date): array
    {
        return \App\Models\BookingSeat::whereHas('booking', function ($q) use ($date) {
            $q->where('bus_route_id', $this->id)
              ->whereDate('travel_date', $date)
              ->where('status', '!=', 'cancelled');
        })->pluck('seat_number')
          ->map(fn($s) => (string) $s)
          ->toArray();
    }

    public function availableSeatsOnDate(string $date): int
    {
        return $this->total_seats - count($this->bookedSeatsOnDate($date));
    }
}