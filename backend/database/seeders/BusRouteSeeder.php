<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusRoute;
use App\Models\BusRouteTemplate;

class BusRouteSeeder extends Seeder
{
    public function run(): void
    {
        $kandy  = BusRouteTemplate::where('name', 'Colombo → Kandy')->first();
        $galle  = BusRouteTemplate::where('name', 'Colombo → Galle')->first();
        $jaffna = BusRouteTemplate::where('name', 'Colombo → Jaffna')->first();
        $kandyColombo = BusRouteTemplate::where('name', 'Kandy → Colombo')->first();
        $galleColombo = BusRouteTemplate::where('name', 'Galle → Colombo')->first();

        BusRoute::create(['bus_number'=>'NB-1234','from_location'=>'Colombo','to_location'=>'Kandy',  'departure_time'=>'06:00','arrival_time'=>'10:00','total_seats'=>40,'price'=>350,'route_template_id'=>$kandy->id]);
        BusRoute::create(['bus_number'=>'SP-5678','from_location'=>'Colombo','to_location'=>'Galle',  'departure_time'=>'07:00','arrival_time'=>'10:30','total_seats'=>40,'price'=>300,'route_template_id'=>$galle->id]);
        BusRoute::create(['bus_number'=>'KC-9012','from_location'=>'Kandy',  'to_location'=>'Colombo','departure_time'=>'08:00','arrival_time'=>'12:00','total_seats'=>40,'price'=>350,'route_template_id'=>$kandyColombo->id]);
        BusRoute::create(['bus_number'=>'NJ-3456','from_location'=>'Colombo','to_location'=>'Jaffna', 'departure_time'=>'09:00','arrival_time'=>'19:00','total_seats'=>40,'price'=>800,'route_template_id'=>$jaffna->id]);
        BusRoute::create(['bus_number'=>'GC-7890','from_location'=>'Galle',  'to_location'=>'Colombo','departure_time'=>'05:30','arrival_time'=>'09:00','total_seats'=>40,'price'=>300,'route_template_id'=>$galleColombo->id]);
        
    }
}