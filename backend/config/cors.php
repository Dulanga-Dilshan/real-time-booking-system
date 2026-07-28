<?php
return [
    'paths'                    => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => [
        'https://localhost',
        'http://localhost',
        'https://127.0.0.1',
        'http://127.0.0.1',
        'https://192.168.8.100',
        'http://192.168.8.100',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => ['Content-Disposition'],
    'max_age'                  => 3600,
    'supports_credentials'     => true,
];