<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverAssignment extends Model
{
    protected $fillable = ['user_id', 'bus_route_id'];

    public function user()     { return $this->belongsTo(User::class); }
    public function busRoute() { return $this->belongsTo(BusRoute::class); }
}