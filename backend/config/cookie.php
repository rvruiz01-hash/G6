<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cookie Configuration
    |--------------------------------------------------------------------------
    */

    'domain' => env('APP_ENV') === 'production' ? '.ondigitalocean.app' : null,
    'secure' => env('APP_ENV') === 'production',
    'same_site' => env('APP_ENV') === 'production' ? 'None' : 'Lax',
];