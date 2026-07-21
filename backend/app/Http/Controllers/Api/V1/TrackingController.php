<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BusRoute;
use App\Models\BusLocation;

class TrackingController extends Controller
{
    public function index()
    {
        $date   = today()->toDateString();
        $routes = BusRoute::with(['routeTemplate', 'location' => function ($q) use ($date) {
                $q->whereDate('travel_date', $date);
            }])
            ->where('is_active', true)
            ->get()
            ->filter(fn($r) => $r->routeTemplate !== null)
            ->map(fn($r) => $this->trackingResource($r));

        return response()->json(['buses' => $routes->values(), 'date' => $date]);
    }

    public function show(BusRoute $busRoute)
    {
        $date = today()->toDateString();
        $busRoute->load(['routeTemplate', 'location' => function ($q) use ($date) {
            $q->whereDate('travel_date', $date);
        }]);

        return response()->json(['bus' => $this->trackingResource($busRoute)]);
    }

    private function trackingResource(BusRoute $route): array
    {
        $stops      = $route->routeTemplate?->stops ?? [];
        $currentIdx = $route->location?->current_stop_index ?? 0;

        return [
            'id'                  => $route->id,
            'bus_number'          => $route->bus_number,
            'from_location'       => $route->from_location,
            'to_location'         => $route->to_location,
            'departure_time'      => $route->departure_time,
            'arrival_time'        => $route->arrival_time,
            'current_stop_index'  => $currentIdx,
            'current_stop'        => $stops[$currentIdx] ?? null,
            'next_stop'           => $stops[$currentIdx + 1] ?? null,
            'latitude'            => $route->location?->latitude,
            'longitude'           => $route->location?->longitude,
            'tracking_mode'       => $route->location?->tracking_mode ?? 'manual',
            'stops'               => $stops,
            'total_stops'         => count($stops),
        ];
    }
}