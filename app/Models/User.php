<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['password' => 'hashed'];

    public function isAdmin(): bool     { return $this->role === 'admin'; }
    public function isBusStaff(): bool  { return $this->role === 'bus_staff'; }
    public function isPassenger(): bool { return $this->role === 'passenger'; }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function driverAssignment()
    {
        return $this->hasOne(DriverAssignment::class);
    }
}