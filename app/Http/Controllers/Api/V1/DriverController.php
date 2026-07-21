<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BusLocation;
use App\Models\Booking;
use App\Events\BusLocationUpdated;
use App\Events\BusGpsUpdated;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function dashboard()
    {
        $assignment = auth()->user()->driverAssignment;
        if (!$assignment) {
            return response()->json(['message' => 'No route assigned'], 404);
        }

        $busRoute   = $assignment->busRoute->load('routeTemplate');
        $travelDate = today()->toDateString();
        $location   = $this->getOrCreateLocation($busRoute, $travelDate);

        $bookings = Booking::where('bus_route_id', $busRoute->id)
            ->whereDate('travel_date', $travelDate)
            ->where('status', 'confirmed')
            ->with('seats')
            ->get();

        return response()->json([
            'bus_route'     => [
                'id'             => $busRoute->id,
                'bus_number'     => $busRoute->bus_number,
                'from_location'  => $busRoute->from_location,
                'to_location'    => $busRoute->to_location,
                'departure_time' => $busRoute->departure_time,
                'arrival_time'   => $busRoute->arrival_time,
                'total_seats'    => $busRoute->total_seats,
            ],
            'stops'              => $busRoute->routeTemplate?->stops ?? [],
            'location'           => [
                'current_stop_index' => $location->current_stop_index,
                'latitude'           => $location->latitude,
                'longitude'          => $location->longitude,
                'tracking_mode'      => $location->tracking_mode,
            ],
            'total_bookings'     => $bookings->count(),
            'booked_seats'       => $busRoute->bookedSeatsOnDate($travelDate),
            'bookings'           => $bookings->map(fn($b) => [
                'booking_reference' => $b->booking_reference,
                'passenger_name'    => $b->passenger_name,
                'nic'               => $b->nic,
                'gender'            => $b->gender,
                'email'             => $b->email,
                'payment_method'    => $b->payment_method,
                'seats'             => $b->seats->pluck('seat_number'),
            ]),
        ]);
    }

    public function updateLocation(Request $request)
    {
        $request->validate(['direction' => 'required|in:next,previous']);

        $assignment = auth()->user()->driverAssignment;
        if (!$assignment) return response()->json(['error' => 'No assignment'], 403);

        $busRoute   = $assignment->busRoute->load('routeTemplate');
        $stops      = $busRoute->routeTemplate?->stops ?? [];
        $maxIndex   = count($stops) - 1;
        $travelDate = today()->toDateString();
        $location   = $this->getOrCreateLocation($busRoute, $travelDate);

        if ($location->tracking_mode === 'auto') {
            return response()->json(['error' => 'Auto mode active'], 403);
        }

        $newIndex = $request->direction === 'next'
            ? min($location->current_stop_index + 1, $maxIndex)
            : max($location->current_stop_index - 1, 0);

        $location->update(['current_stop_index' => $newIndex]);

        $lat = $stops[$newIndex]['lat'] ?? null;
        $lng = $stops[$newIndex]['lng'] ?? null;

        try {
            broadcast(new BusLocationUpdated($busRoute, $newIndex, $travelDate, $lat, $lng));
        } catch (\Exception $e) {
            \Log::error('Broadcast failed: ' . $e->getMessage());
        }

        return response()->json([
            'current_stop_index' => $newIndex,
            'stop_name'          => $stops[$newIndex]['name'] ?? '',
            'latitude'           => $lat,
            'longitude'          => $lng,
        ]);
    }

    public function updateGps(Request $request)
    {
        $request->validate([
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $assignment = auth()->user()->driverAssignment;
        if (!$assignment) return response()->json(['error' => 'No assignment'], 403);

        $busRoute   = $assignment->busRoute->load('routeTemplate');
        $stops      = $busRoute->routeTemplate?->stops ?? [];
        $travelDate = today()->toDateString();
        $location   = $this->getOrCreateLocation($busRoute, $travelDate);

        $nearestIndex = $this->findNearestStop($request->latitude, $request->longitude, $stops);

        $location->update([
            'latitude'           => $request->latitude,
            'longitude'          => $request->longitude,
            'current_stop_index' => $nearestIndex,
        ]);

        try {
            broadcast(new BusGpsUpdated($busRoute, $request->latitude, $request->longitude, $nearestIndex, $travelDate));
        } catch (\Exception $e) {}

        return response()->json([
            'current_stop_index' => $nearestIndex,
            'stop_name'          => $stops[$nearestIndex]['name'] ?? '',
        ]);
    }

    public function setTrackingMode(Request $request)
    {
        $request->validate(['mode' => 'required|in:manual,auto']);
        $assignment = auth()->user()->driverAssignment;
        if (!$assignment) return response()->json(['error' => 'No assignment'], 403);

        $location = $this->getOrCreateLocation($assignment->busRoute, today()->toDateString());
        $location->update(['tracking_mode' => $request->mode]);

        return response()->json(['mode' => $request->mode]);
    }

    private function getOrCreateLocation($busRoute, $travelDate)
    {
        $location = BusLocation::where('bus_route_id', $busRoute->id)
            ->whereDate('travel_date', $travelDate)
            ->first();

        if (!$location) {
            $location = BusLocation::create([
                'bus_route_id'       => $busRoute->id,
                'travel_date'        => $travelDate,
                'current_stop_index' => 0,
                'tracking_mode'      => 'manual',
            ]);
        }

        return $location;
    }

    private function findNearestStop(float $lat, float $lng, array $stops): int
    {
        $nearestIndex    = 0;
        $nearestDistance = PHP_FLOAT_MAX;

        foreach ($stops as $stop) {
            if (!isset($stop['lat'], $stop['lng'])) continue;
            $distance = $this->haversine($lat, $lng, $stop['lat'], $stop['lng']);
            if ($distance < $nearestDistance) {
                $nearestDistance = $distance;
                $nearestIndex    = $stop['index'];
            }
        }

        return $nearestIndex;
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat/2)**2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng/2)**2;
        return $r * 2 * atan2(sqrt($a), sqrt(1-$a));
    }
}
