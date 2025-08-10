<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Base;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;
use Pterodactyl\Http\Controllers\Nadhi;

Route::get('/', [Base\IndexController::class, 'index'])->name('index')->fallback();
Route::get('/nadhi/logo', [Nadhi\BaseController::class, 'logo'])->name('base.logo');

Route::get('/account', [Base\IndexController::class, 'index'])
  ->withoutMiddleware(RequireTwoFactorAuthentication::class)
  ->name('account');

Route::get('/locales/locale.json', Base\LocaleController::class)
  ->withoutMiddleware(['auth', RequireTwoFactorAuthentication::class])
  ->where('namespace', '.*');

Route::get('/{react}', [Base\IndexController::class, 'index'])
  ->where('react', '^(?!(\/)?(api|auth|admin|daemon)).+');
