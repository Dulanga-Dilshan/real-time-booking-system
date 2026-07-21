<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusRouteTemplate;
use Illuminate\Http\Request;

class AdminRouteTemplateController extends Controller
{
    public function index()
    {
        return response()->json(['templates' => BusRouteTemplate::withCount('busRoutes')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string',
            'stops' => 'required|array',
        ]);

        $template = BusRouteTemplate::create([
            'name'  => $request->name,
            'stops' => $request->stops,
        ]);

        return response()->json(['template' => $template], 201);
    }

    public function update(Request $request, BusRouteTemplate $template)
    {
        $request->validate([
            'name'  => 'required|string',
            'stops' => 'required|array',
        ]);

        $template->update($request->only(['name', 'stops']));
        return response()->json(['template' => $template]);
    }

    public function destroy(BusRouteTemplate $template)
    {
        $template->delete();
        return response()->json(['message' => 'Template deleted.']);
    }
}