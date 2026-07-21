<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DriverAssignment;
use App\Models\BusRoute;
use Illuminate\Http\Request;

class AdminDriverController extends Controller
{
    public function index()
    {
        $staff     = User::where('role', 'bus_staff')->with('driverAssignment.busRoute')->get();
        $routes    = BusRoute::where('is_active', true)->get();

        return response()->json(['staff' => $staff, 'routes' => $routes]);
    }

    public function assign(Request $request, User $user)
    {
        $request->validate(['bus_route_id' => 'required|exists:bus_routes,id']);

        DriverAssignment::updateOrCreate(
            ['user_id'      => $user->id],
            ['bus_route_id' => $request->bus_route_id]
        );

        return response()->json(['message' => "Route assigned to {$user->name}."]);
    }

    public function unassign(User $user)
    {
        $user->driverAssignment?->delete();
        return response()->json(['message' => "Assignment removed."]);
    }
}