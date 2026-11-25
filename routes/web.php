<?php

use Illuminate\Support\Facades\Route;

// Tangkap semua rute web SPA di luar endpoint /api dan /up agar ditangani React Router.
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api(?:/|$)|up(?:/|$)).*$');
