<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusRoute;
use Illuminate\Http\Request;

class AdminRouteController extends Controller
{
    public function index()
    {
        $routes = BusRoute::with('routeTemplate')
            ->withCount('bookings')
            ->get();

        return response()->json(['routes' => $routes]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bus_number'       => 'nullable|string|max:20',
            'from_location'    => 'required|string',
            'to_location'      => 'required|string',
            'departure_time'   => 'required',
            'arrival_time'     => 'required',
            'total_seats'      => 'required|integer|min:1|max:100',
            'price'            => 'required|numeric|min:0',
            'route_template_id'=> 'nullable|exists:bus_route_templates,id',
        ]);

        $route = BusRoute::create($request->only([
            'bus_number', 'from_location', 'to_location',
            'departure_time', 'arrival_time', 'total_seats',
            'price', 'route_template_id',
        ]) + ['is_active' => true]);

        return response()->json(['route' => $route], 201);
    }

    public function update(Request $request, BusRoute $busRoute)
    {
        $request->validate([
            'bus_number'       => 'nullable|string|max:20',
            'from_location'    => 'required|string',
            'to_location'      => 'required|string',
            'departure_time'   => 'required',
            'arrival_time'     => 'required',
            'total_seats'      => 'required|integer|min:1|max:100',
            'price'            => 'required|numeric|min:0',
            'route_template_id'=> 'nullable|exists:bus_route_templates,id',
            'is_active'        => 'boolean',
        ]);

        $busRoute->update($request->only([
            'bus_number', 'from_location', 'to_location', 'departure_time',
            'arrival_time', 'total_seats', 'price', 'route_template_id', 'is_active',
        ]));

        return response()->json(['route' => $busRoute]);
    }

    public function destroy(BusRoute $busRoute)
    {
        $busRoute->delete();
        return response()->json(['message' => 'Route deleted.']);
    }
}