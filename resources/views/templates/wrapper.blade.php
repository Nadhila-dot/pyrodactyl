<!DOCTYPE html>
<!--
 _   _      _ _         _   _           _ _     _ 
| | | | ___| | | ___   | \ | | __ _  __| | |__ (_)
| |_| |/ _ \ | |/ _ \  |  \| |/ _` |/ _` | '_ \| |
|  _  |  __/ | | (_) | | |\  | (_| | (_| | | | | |
|_| |_|\___|_|_|\___/  |_| \_|\__,_|\__,_|_| |_|_|
Beating Nebula, stellar and Arix
Made with love! (Main repo PYRO)
cache: beta-1
loader: beta-00xj
-->
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-app-env="{{ env('APP_ENV') }}">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name') }}</title>

        
        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">

            <!-- Version details, internal name for beta versions -->
            <meta name="scan-valid" content="beta-00xj" />
      
            
            <meta name="apple-mobile-web-app-title" content="Pterodactyl-Contava" />
            <link rel="manifest" href="/favicons/site.webmanifest" />

            <meta name="theme-color" content="#000000">
            <meta name="darkreader-lock">
        @show
        
       
        <!-- Load fonts with display=swap to prevent invisible text -->
        <style>
            @import url('https://fonts.bunny.net/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        </style>

        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">

       
        



        

        <!-- Loading management script -->
        <script>
            
            document.addEventListener('DOMContentLoaded', function() {
                document.body.classList.add('loading');
                
              
                window.addEventListener('load', function() {
                    setTimeout(function() {
                        const loadingScreen = document.querySelector('.app-loading');
                        if (loadingScreen) {
                            loadingScreen.classList.add('hidden');
                            setTimeout(() => {
                                loadingScreen.remove();
                                document.body.classList.remove('loading');
                            }, 300);
                        }
                    }, 100);
                });
            });
            
            // Handle theme changes smoothly
            window.enableThemeTransition = function() {
                document.body.classList.add('theme-transition');
                setTimeout(() => {
                    document.body.classList.remove('theme-transition');
                }, 200);
            };
        </script>
        
        @yield('assets')
        @include('layouts.scripts')

       @viteReactRefresh
       @vite('resources/scripts/index.tsx')

       <!-- Pterodactyl Scripts -->
       <script>
            window.company = window.company || {};
            window.company.name = "{{ config('app.name', 'Panel') }}";
        </script>
        <script>
        (function() {
            // Get stored accent color from localStorage
            const accent = localStorage.getItem('accent');
            
            if (accent) {
                // Apply it to the root element
                document.documentElement.style.setProperty('--main-color', accent);
            }
        })();
        </script>

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show
       
        <style>
            html, body, * {
                font-family: var(--main-font, sans-serif) !important;
                --main-color: {{ $accent ?? '#10b981' }};  /* Accent color for panel. Defaults to emerald-500 if not set. */

            }
            /* Badge styles */
            .dom-waiting-badge {
                display: inline-flex;
                align-items: center;
                position: fixed;
                top: 16px;
                right: 16px;
                background-color: #18181b;
                color: #f4f4f5;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                font-weight: 500;
                padding: 0.25rem 0.75rem;
                border: 1px solid #27272a;
                box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
                letter-spacing: 0.01em;
                z-index: 10000;
                transition: opacity 0.3s cubic-bezier(.4,0,.2,1);
                user-select: none;
                gap: 0.5rem;
            }
        </style>
        
        <style>
           
            html {
                font-display: swap;
                /* Dark theme by default to prevent white flash, your welcome :D*/
                background-color: #0a0a0a;
                color: #ffffff;
            }
            
           
            body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                background-color: #000000;
                color: #ffffff;
                transition: opacity 0.3s ease-in-out;
            }
            
           
            #nadhi-mng-body {
                min-height: 100vh;
                background-color: #000000;
            }
            
            /* Loading spinner to prevent blank screen */
            .app-loading {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #0a0a0a;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.3s ease-in-out;
            }
            
            .app-loading.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
           
            .loading-spinner {
               
                border: 2px solid #333;
                border-top: 2px solid #666;
                border-radius: 50%;
               
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
           
            * {
                box-sizing: border-box;
            }
            
           
            body.loading {
                overflow: hidden;
            }
            
           
            .theme-transition * {
                transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
            }
        </style>
       
    </head>

    <body>
        <div class="dom-waiting-badge">Powered by Nadhi.dev</div>
        <!-- Loading screen for zero flash bangs mate -->
        <div class="app-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div
                class="loading-spinner"
                style="
                    width: 64px;
                    height: 64px;
                    border-width: 6px;
                    border-radius: 50%;
                    border-color: rgba(255, 255, 255, 0.2); /* Matches default color */
                    border-top-color: rgb(255, 255, 255);
                    animation: spin 1s cubic-bezier(0.55, 0.25, 0.25, 0.7) infinite;
                "
            ></div>
            
        </div>
        
        <!-- App container -->
       <body nadhi-mng-body class="{{ $css['body'] }}" style="background-color: #000000; height: 100%; width: 100%; margin: 0; padding: 0;">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        </body>
        
        <!-- Signal to React that DOM is ready -->
        <!-- If the dom is not ready, React will not mount properly -->
        <script>
            window.domReady = true;

        </script>
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                const badge = document.querySelector('.dom-waiting-badge');
                if (badge) {
                    badge.classList.add('hidden');
                    setTimeout(() => badge.remove(), 300); // Remove badge after transition
                }
            });
        </script>
    </body>

</html>