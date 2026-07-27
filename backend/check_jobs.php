<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cnt = Illuminate\Support\Facades\DB::table('jobs')->count();
echo $cnt . PHP_EOL;
