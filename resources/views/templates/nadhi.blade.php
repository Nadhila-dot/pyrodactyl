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

        <!-- Flash preventer 5000 -->
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
                background-color: #0a0a0a;
                color: #ffffff;
                transition: opacity 0.3s ease-in-out;
            }
            
           
            #nadhi\.dev-app {
                min-height: 100vh;
                background-color: #0a0a0a;
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
                width: 32px;
                height: 32px;
                border: 2px solid #333;
                border-top: 2px solid #666;
                border-radius: 50%;
                animation: spin 1s linear infinite;
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



        

        <!-- Loading management script -->
        <script>
            // Prevent flash by managing loading state
            document.addEventListener('DOMContentLoaded', function() {
                document.body.classList.add('loading');
                
                // Hide loading screen after React app mounts
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
            }
        </style>
       
    </head>

    <body>
        <!-- Loading screen for zero flash bangs mate -->
         <div class="app-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="loading-spinner" style="width: 32px; height: 32px; border: 2px solid #333; border-top: 2px solid #666; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 8px; font-weight: 100; font-size: 1rem; color: #fff;">Just a moment — making things pretty.</p>
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
        <script>
            window.domReady = true;
        </script>
    </body>

</html>