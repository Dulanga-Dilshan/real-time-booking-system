<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireBusStaffRole
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isBusStaff()) {
            return response()->json(['message' => 'Access denied. Bus staff role required.'], 403);
        }
        return $next($request);
    }
}