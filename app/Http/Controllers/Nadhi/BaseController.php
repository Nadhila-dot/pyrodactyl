<?php


namespace Pterodactyl\Http\Controllers\Nadhi;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Pterodactyl\Http\Controllers\Controller;

class BaseController extends Controller
{
    /**
     * The default announcement data.
     */
    protected array $defaultAnnouncement = [
        'icon' => '🎉',
        'title' => 'Welcome to Creepercloud!',
        'description' => 'Thank you for using our services. We are excited to have you on board!',
        'type' => 'info'
    ];

    /**
     * The default logo value.
     */
    protected string $defaultLogo = '/images/default-logo.png';

    /**
     * The default accent color value.
     */
    protected string $defaultAccent = '#10b981';

    /**
     * Get the announcement data from storage or use default.
     */
    protected function getAnnouncement(): array
    {
        if (Storage::exists('announcement.json')) {
            return json_decode(Storage::get('announcement.json'), true) ?? $this->defaultAnnouncement;
        }
        Storage::put('announcement.json', json_encode($this->defaultAnnouncement));
        return $this->defaultAnnouncement;
    }

    /**
     * Get the logo from storage or use default.
     */
    protected function getLogo(): string
    {
        if (Storage::exists('logo.json')) {
            $data = json_decode(Storage::get('logo.json'), true);
        return $data['logo'] ?? $this->defaultLogo;
    }
    Storage::put('logo.json', json_encode(['logo' => $this->defaultLogo]));
    return $this->defaultLogo;
}

    /**
     * Get the accent color from storage or use default.
     */
    protected function getAccent(): string
    {
        if (Storage::exists('accent.json')) {
            $data = json_decode(Storage::get('accent.json'), true);
            return $data['accent'] ?? $this->defaultAccent;
        }
        Storage::put('accent.json', json_encode(['accent' => $this->defaultAccent]));
        return $this->defaultAccent;
    }

    /**
     * Display the announcement.
     */
    public function annouce()
    {
        return response()->json($this->getAnnouncement());
    }

    /**
     * Update the announcement data and save to storage.
     */
    public function setAnnouncement(Request $request)
    {
        $announcement = array_merge($this->getAnnouncement(), $request->only([
            'icon', 'title', 'description', 'type'
        ]));

        Storage::put('announcement.json', json_encode($announcement));

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
     * Update the logo and save to storage as JSON.
     */
    public function setLogo(Request $request)
    {
        $logo = $request->input('logo', $this->defaultLogo);
        Storage::put('logo.json', json_encode(['logo' => $logo]));

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
     * Update the accent color and save to storage as JSON.
     */
    public function setAccent(Request $request)
    {
        $accent = $request->input('accent', $this->defaultAccent);
        Storage::put('accent.json', json_encode(['accent' => $accent]));

        return response()->json(['message' => 'Accent color updated.', 'accent' => $accent]);
    }
}