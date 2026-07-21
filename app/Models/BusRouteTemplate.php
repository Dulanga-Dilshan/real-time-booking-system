<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusRouteTemplate extends Model
{
    protected $fillable = ['name', 'stops'];
    protected $casts    = ['stops' => 'array'];

    public function busRoutes()
    {
        return $this->hasMany(BusRoute::class, 'route_template_id');
    }

    public function firstStop(): array
    {
        return $this->stops[0] ?? [];
    }

    public function lastStop(): array
    {
        return $this->stops[count($this->stops) - 1] ?? [];
    }
}