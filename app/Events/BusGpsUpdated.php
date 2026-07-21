<?php
namespace App\Events;

use App\Models\BusRoute;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BusGpsUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public BusRoute $busRoute,
        public float $latitude,
        public float $longitude,
        public int $currentStopIndex,
        public string $travelDate
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("bus-location.{$this->busRoute->id}.{$this->travelDate}");
    }

    public function broadcastAs(): string { return 'BusLocationUpdated'; }

    public function broadcastWith(): array
    {
        $freshRoute = \App\Models\BusRoute::find($this->busRoute->id);

        return [
            'bus_route_id'       => $freshRoute?->id ?? $this->busRoute->id,
            'current_stop_index' => $this->currentStopIndex,
            'latitude'           => $this->latitude,
            'longitude'          => $this->longitude,
        ];
    }
}