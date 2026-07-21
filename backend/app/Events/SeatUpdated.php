<?php
namespace App\Events;

use App\Models\BusRoute;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SeatUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public BusRoute $busRoute,
        public string $travelDate
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("bus.{$this->busRoute->id}.{$this->travelDate}");
    }

    public function broadcastAs(): string
    {
        return 'SeatUpdated';
    }

    public function broadcastWith(): array
    {
        $freshRoute = \App\Models\BusRoute::find($this->busRoute->id);

        if (!$freshRoute) {
            return ['booked_seats' => []];
        }

        $seats = $freshRoute->bookedSeatsOnDate($this->travelDate);

        return ['booked_seats' => $seats];
    }
}