<?php

// Nadhi BaseController can be cached.
// Since these values are rarely changed, we can cache them for performance.
// small step to improve performance. 


namespace Pterodactyl\Http\Controllers\Nadhi;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Pterodactyl\Http\Controllers\Controller;

class BaseController extends Controller
{
    protected array $defaultAnnouncement = [
        'icon' => '🎉',
        'title' => 'Welcome to Creepercloud!',
        'description' => 'Thank you for using our services. We are excited to have you on board!',
        'type' => 'info'
    ];

    protected string $defaultLogo = '/images/default-logo.png';
    protected string $defaultAccent = '#10b981';

    /**
     * Get the announcement data from cache/storage or use default.
     */
    protected function getAnnouncement(): array
    {
        return Cache::rememberForever('announcement', function () {
            if (Storage::exists('announcement.json')) {
                return json_decode(Storage::get('announcement.json'), true) ?? $this->defaultAnnouncement;
            }
            Storage::put('announcement.json', json_encode($this->defaultAnnouncement));
            return $this->defaultAnnouncement;
        });
    }

    /**
     * Get the logo from cache/storage or use default.
     */
    protected function getLogo(): string
    {
        return Cache::rememberForever('logo', function () {
            if (Storage::exists('logo.json')) {
                $data = json_decode(Storage::get('logo.json'), true);
                return $data['logo'] ?? $this->defaultLogo;
            }
            Storage::put('logo.json', json_encode(['logo' => $this->defaultLogo]));
            return $this->defaultLogo;
        });
    }

    /**
     * Get the accent color from cache/storage or use default.
     */
    protected function getAccent(): string
    {
        return Cache::rememberForever('accent', function () {
            if (Storage::exists('accent.json')) {
                $data = json_decode(Storage::get('accent.json'), true);
                return $data['accent'] ?? $this->defaultAccent;
            }
            Storage::put('accent.json', json_encode(['accent' => $this->defaultAccent]));
            return $this->defaultAccent;
        });
    }

    /**
     * Display the announcement.
     */
    public function annouce()
    {
        return response()->json($this->getAnnouncement());
    }

    /**
     * Update the announcement data and save to storage/cache.
     */
    public function setAnnouncement(Request $request)
    {
        $announcement = array_merge($this->getAnnouncement(), $request->only([
            'icon', 'title', 'description', 'type'
        ]));

        Storage::put('announcement.json', json_encode($announcement));
        Cache::forget('announcement'); // Reset cache
        $this->getAnnouncement(); // Warm cache

        return response()->json(['message' => 'Announcement updated.', 'announcement' => $announcement]);
    }

    /**
     * Display the logo.
     */
    public function logo()
    {
        return response()->json(['logo' => $this->getLogo()]);
    }

    /**
     * Update the logo and save to storage/cache as JSON.
     */
    public function setLogo(Request $request)
    {
        $logo = $request->input('logo', $this->defaultLogo);
        Storage::put('logo.json', json_encode(['logo' => $logo]));
        Cache::forget('logo'); // Reset cache
        $this->getLogo(); // Warm cache

        return response()->json(['message' => 'Logo updated.', 'logo' => $logo]);
    }

    /**
     * Display the accent color.
     */
    public function accent()
    {
        return response()->json(['accent' => $this->getAccent()]);
    }

    /**
     * Update the accent color and save to storage/cache as JSON.
     */
    public function setAccent(Request $request)
    {
        $accent = $request->input('accent', $this->defaultAccent);
        Storage::put('accent.json', json_encode(['accent' => $accent]));
        Cache::forget('accent'); // Reset cache
        $this->getAccent(); // Warm cache

        return response()->json(['message' => 'Accent color updated.', 'accent' => $accent]);
    }
}