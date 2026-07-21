<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'user' => [
                'id'    => $request->user()->id,
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
                'role'  => $request->user()->role,
            ],
        ]);
    }

    public function bookings(Request $request)
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->with(['busRoute', 'seats'])
            ->latest()
            ->get()
            ->map(fn($b) => [
                'booking_reference' => $b->booking_reference,
                'status'            => $b->status,
                'travel_date'       => $b->travel_date->toDateString(),
                'seats'             => $b->seats->pluck('seat_number'),
                'route'             => [
                    'from_location' => $b->busRoute->from_location,
                    'to_location'   => $b->busRoute->to_location,
                ],
            ]);

        return response()->json(['bookings' => $bookings]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $request->user()->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated.']);
    }
}