<!DOCTYPE html>
<!--
 _   _      _ _         _   _           _ _     _ 
| | | | ___| | | ___   | \ | | __ _  __| | |__ (_)
| |_| |/ _ \ | |/ _ \  |  \| |/ _` |/ _` | '_ \| |
|  _  |  __/ | | (_) | | |\  | (_| | (_| | | | | |
|_| |_|\___|_|_|\___/  |_| \_|\__,_|\__,_|_| |_|_|
Made with love! (Main repo PYRO)
-->
<html nadhi.dev-mnger lang="en" style="background-color: #000000; height: 100%; width: 100%; margin: 0; padding: 0;">
    <head>
        <title>{{ config('app.name', 'Panel') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">

           
            <meta name="apple-mobile-web-app-title" content="Pterodactyl-Contava" />
            <link rel="manifest" href="/favicons/site.webmanifest" />

            <meta name="theme-color" content="#000000">
            <meta name="darkreader-lock">
        @show

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
                font-family: var(--main-font, 'Space Grotesk', sans-serif) !important;
            }
        </style>
        
        @yield('assets')

        @include('layouts.scripts')

        @viteReactRefresh
        @vite('resources/scripts/index.tsx')
    </head>
    <body nadhi-mng-body class="{{ $css['body'] }}" style="background-color: #000000; height: 100%; width: 100%; margin: 0; padding: 0;">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
    </body>
</html>
