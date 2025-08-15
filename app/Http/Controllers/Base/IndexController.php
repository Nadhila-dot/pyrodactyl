<?php


namespace Pterodactyl\Http\Controllers\Base;

use Illuminate\View\View;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\ServerRepositoryInterface;
use Illuminate\Support\Facades\Storage;

class IndexController extends Controller
{
    /**
     * IndexController constructor.
     */
    public function __construct(
        protected ServerRepositoryInterface $repository,
        protected ViewFactory $view,
    ) {
    }

    /**
     * Returns listing of user's servers.
     */
    public function index(): View
    {
        // Get accent color from storage or use default
        $accent = '#10b981';
        if (Storage::exists('accent.json')) {
            $data = json_decode(Storage::get('accent.json'), true);
            $accent = $data['accent'] ?? $accent;
        }

        return $this->view->make('templates/base.core', [
            'accent' => $accent,
        ]);
    }
}