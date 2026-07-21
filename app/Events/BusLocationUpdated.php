<?php
namespace App\Events;

use App\Models\BusRoute;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BusLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public BusRoute $busRoute,
        public int $currentStopIndex,
        public string $travelDate,
        public ?float $latitude  = null,
        public ?float $longitude = null,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("bus-location.{$this->busRoute->id}.{$this->travelDate}");
    }

    public function broadcastAs(): string { return 'BusLocationUpdated'; }

    public function broadcastWith(): array
    {
        $freshRoute = \App\Models\BusRoute::with('routeTemplate')->find($this->busRoute->id);
        $stops = $freshRoute?->routeTemplate?->stops ?? [];
        $stop  = $stops[$this->currentStopIndex] ?? null;

        return [
            'bus_route_id'       => $freshRoute?->id ?? $this->busRoute->id,
            'current_stop_index' => $this->currentStopIndex,
            'latitude'           => $this->latitude  ?? $stop['lat'] ?? null,
            'longitude'          => $this->longitude ?? $stop['lng'] ?? null,
        ];
    }
}