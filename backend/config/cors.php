<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Aquí puedes configurar tus ajustes para CORS, definiendo qué operaciones
    | pueden realizarse desde otros orígenes en los navegadores.
    |
    | Más información: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // 'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'paths' => ['api/*', 'auth/*', 'employee-photo/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://g6-frontend-3jppr.ondigitalocean.app',
],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization','X-Token-Expires-At'],

    'max_age' => 0,

    'supports_credentials' => true,
];
    // 'exposed_headers' => [],
