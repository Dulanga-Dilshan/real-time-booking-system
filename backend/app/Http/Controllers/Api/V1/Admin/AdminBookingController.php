<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Events\SeatUpdated;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    public function index(Request $request)
    {
        $bookings = Booking::with(['busRoute', 'seats'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('date'),   fn($q) => $q->whereDate('travel_date', $request->date))
            ->latest()
            ->paginate(20);

        return response()->json($bookings);
    }

    public function cancel(Booking $booking)
    {
        $booking->load(['busRoute', 'seats']);
        $booking->update(['status' => 'cancelled']);

        try {
            broadcast(new SeatUpdated($booking->busRoute, $booking->travel_date->toDateString()));
        } catch (\Exception $e) {}

        return response()->json(['message' => "Booking {$booking->booking_reference} cancelled."]);
    }

    public function stats()
    {
        return response()->json([
            'total_routes'   => \App\Models\BusRoute::count(),
            'total_bookings' => Booking::where('status', 'confirmed')->count(),
            'today_bookings' => Booking::where('status', 'confirmed')->whereDate('travel_date', today())->count(),
        ]);
    }
}