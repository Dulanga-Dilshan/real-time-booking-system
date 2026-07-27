<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\BusRoute;
use App\Events\SeatUpdated;
use App\Mail\BookingReceiptMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'bus_route_id'      => 'required|exists:bus_routes,id',
            'seat_numbers'      => 'required|array|min:1|max:5',
            'seat_numbers.*'    => 'required|string',
            'travel_date'       => 'required|date|after_or_equal:today',
            'passenger_name'    => 'required|string|max:255',
            'gender'            => 'required|in:male,female,other',
            'email'             => 'required|email|max:255',
            'nic'               => ['required', 'string', 'max:20', 'regex:/^(?:\d{9}[vVxX]|\d{12})$/'],
            'board_stop_index'  => 'required|integer|min:0',
            'alight_stop_index' => 'required|integer|min:0',
            'payment_method'    => 'required|in:online,station',
        ]);

        $busRoute    = BusRoute::findOrFail($request->bus_route_id);
        $alreadyBooked = $busRoute->bookedSeatsOnDate($request->travel_date);
        $takenSeats  = array_intersect(
            array_map('strval', $request->seat_numbers),
            array_map('strval', $alreadyBooked)
        );

        if (!empty($takenSeats)) {
            return response()->json([
                'message' => 'Seat(s) ' . implode(', ', $takenSeats) . ' are no longer available.',
                'taken_seats' => array_values($takenSeats),
            ], 422);
        }

        $booking = DB::transaction(function () use ($request, $busRoute) {
            $booking = Booking::create([
                'user_id'           => auth()->id(),
                'bus_route_id'      => $busRoute->id,
                'bus_number'        => $busRoute->bus_number,
                'travel_date'       => $request->travel_date,
                'passenger_name'    => $request->passenger_name,
                'gender'            => $request->gender,
                'email'             => $request->email,
                'nic'               => $request->nic,
                'board_stop_index'  => $request->board_stop_index,
                'alight_stop_index' => $request->alight_stop_index,
                'payment_method'    => $request->payment_method,
                'status'            => 'confirmed',
            ]);

            foreach ($request->seat_numbers as $seat) {
                BookingSeat::create([
                    'booking_id'  => $booking->id,
                    'seat_number' => $seat,
                ]);
            }

            return $booking;
        });

        try {
            broadcast(new SeatUpdated($busRoute, $request->travel_date))->toOthers();
        } catch (\Exception $e) {
            \Log::error('Broadcast failed: ' . $e->getMessage());
        }

        $booking->load(['busRoute', 'seats']);

        return response()->json([
            'message' => 'Booking confirmed',
            'booking' => $this->bookingResource($booking),
        ], 201);
    }

    public function show(string $reference)
    {
        $booking = Booking::where('booking_reference', strtoupper($reference))
            ->with(['busRoute', 'seats'])
            ->firstOrFail();

        return response()->json(['booking' => $this->bookingResource($booking)]);
    }

    public function cancel(Request $request, string $reference)
    {
        $booking = Booking::where('booking_reference', strtoupper($reference))
            ->where('status', 'confirmed')
            ->with(['busRoute', 'seats'])
            ->firstOrFail();

        // Auth check
        if (auth()->check()) {
            if (!auth()->user()->isAdmin() && $booking->user_id !== auth()->id()) {
                return response()->json(['message' => 'This booking does not belong to your account.'], 403);
            }
        } else {
            $request->validate(['nic' => 'required|string']);
            if (strtoupper($request->nic) !== strtoupper($booking->nic)) {
                return response()->json(['message' => 'NIC does not match this booking.'], 422);
            }
        }

        $booking->update(['status' => 'cancelled']);

        try {
            broadcast(new SeatUpdated($booking->busRoute, $booking->travel_date->toDateString()));
        } catch (\Exception $e) {}

        return response()->json(['message' => 'Booking cancelled successfully.']);
    }

    public function downloadReceipt(string $reference)
    {
        $booking = Booking::where('booking_reference', strtoupper($reference))
            ->with(['busRoute', 'seats'])
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.receipt', compact('booking'));
        return $pdf->download("BusBook-{$booking->booking_reference}.pdf");
    }

    public function emailReceipt(string $reference)
    {
        $booking = Booking::where('booking_reference', strtoupper($reference))
            ->with(['busRoute', 'seats'])
            ->firstOrFail();

        if (!$booking->email) {
            return response()->json(['message' => 'No email on this booking.'], 422);
        }

        Mail::to($booking->email)->send(new BookingReceiptMail($booking));

        return response()->json(['message' => "Receipt sent to {$booking->email}"]);
    }

    private function bookingResource(Booking $booking): array
    {
        return [
            'id'                => $booking->id,
            'booking_reference' => $booking->booking_reference,
            'bus_number'        => $booking->bus_number,
            'travel_date'       => $booking->travel_date->toDateString(),
            'passenger_name'    => $booking->passenger_name,
            'gender'            => $booking->gender,
            'email'             => $booking->email,
            'nic'               => $booking->nic,
            'payment_method'    => $booking->payment_method,
            'status'            => $booking->status,
            'board_stop_index'  => $booking->board_stop_index,
            'alight_stop_index' => $booking->alight_stop_index,
            'seats'             => $booking->seats->pluck('seat_number'),
            'route'             => $booking->busRoute ? [
                'id'             => $booking->busRoute->id,
                'from_location'  => $booking->busRoute->from_location,
                'to_location'    => $booking->busRoute->to_location,
                'departure_time' => $booking->busRoute->departure_time,
                'arrival_time'   => $booking->busRoute->arrival_time,
                'price'          => $booking->busRoute->price,
            ] : null,
        ];
    }
}