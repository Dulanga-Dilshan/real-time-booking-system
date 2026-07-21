<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusLocation extends Model
{
    protected $fillable = ['bus_route_id', 'travel_date', 'current_stop_index'];
    protected $casts    = ['travel_date' => 'date'];

    public function busRoute()
    {
        return $this->belongsTo(BusRoute::class);
    }
}