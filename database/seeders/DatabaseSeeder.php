<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\BusRouteTemplateSeeder;
use Database\Seeders\BusRouteSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        \App\Models\User::create([
            'name'     => 'Admin',
            'email'    => 'admin@bus.com',
            'password' => bcrypt('password'),
            'role'     => 'admin',
        ]);

        \App\Models\User::create([
            'name'     => 'John Passenger',
            'email'    => 'john@bus.com',
            'password' => bcrypt('password'),
            'role'     => 'passenger',
        ]);

        \App\Models\User::create([
            'name'     => 'Driver 1',
            'email'    => 'driver@bus.com',
            'password' => bcrypt('password'),
            'role'     => 'bus_staff',
        ]);

        $this->call(BusRouteTemplateSeeder::class);
        $this->call(BusRouteSeeder::class);
    }
}
