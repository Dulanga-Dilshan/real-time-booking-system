<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireAdminRole
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Access denied. Admin role required.'], 403);
        }
        return $next($request);
    }
}