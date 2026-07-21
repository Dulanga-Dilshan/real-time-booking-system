<?php
return [
    'paths'                => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods'      => ['*'],
    'allowed_origins'      => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],
    'allowed_origins_patterns' => ['#^https?://192\.168\.\d+\.\d+#'],
    'allowed_headers'      => ['*'],
    'exposed_headers'      => ['Content-Disposition'],
    'max_age'              => 3600,
    'supports_credentials' => true,
];