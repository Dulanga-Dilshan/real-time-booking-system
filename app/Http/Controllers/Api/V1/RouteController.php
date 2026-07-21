<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BusRoute;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $date  = $request->get('date', today()->toDateString());
        $query = BusRoute::with('routeTemplate')->where('is_active', true);

        if ($request->filled('from')) {
            $query->where('from_location', 'like', '%' . $request->from . '%');
        }
        if ($request->filled('to')) {
            $query->where('to_location', 'like', '%' . $request->to . '%');
        }

        $routes = $query->get()->map(fn($r) => $this->routeResource($r, $date));

        return response()->json(['routes' => $routes, 'date' => $date]);
    }

    public function show(BusRoute $busRoute, Request $request)
    {
        $date = $request->get('date', today()->toDateString());
        $busRoute->load('routeTemplate');

        return response()->json([
            'route'       => $this->routeResource($busRoute, $date),
            'booked_seats'=> $busRoute->bookedSeatsOnDate($date),
            'stops'       => $busRoute->routeTemplate?->stops ?? [],
        ]);
    }

    public function seats(BusRoute $busRoute, Request $request)
    {
        $date = $request->get('date', today()->toDateString());
        return response()->json([
            'booked_seats'    => $busRoute->bookedSeatsOnDate($date),
            'available_seats' => $busRoute->availableSeatsOnDate($date),
            'total_seats'     => $busRoute->total_seats,
        ]);
    }

    private function routeResource(BusRoute $route, string $date): array
    {
        return [
            'id'              => $route->id,
            'bus_number'      => $route->bus_number,
            'from_location'   => $route->from_location,
            'to_location'     => $route->to_location,
            'departure_time'  => $route->departure_time,
            'arrival_time'    => $route->arrival_time,
            'total_seats'     => $route->total_seats,
            'available_seats' => $route->availableSeatsOnDate($date),
            'price'           => $route->price,
            'is_active'       => $route->is_active,
            'route_template_id' => $route->route_template_id,
            'stops'           => $route->routeTemplate?->stops ?? [],
        ];
    }
}