@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
  Settings
@endsection

@section('content-header')
  <h1>Panel Settings<small>Configure Pterodactyl to your liking.</small></h1>
  <ol class="breadcrumb">
    <li><a href="{{ route('admin.index') }}">Admin</a></li>
    <li class="active">Settings</li>
  </ol>
@endsection

@section('content')
  @yield('settings::nav')
  <div class="row">
    <div class="col-xs-12">
      <div class="box">
        <div class="box-header with-border">
          <h3 class="box-title">Panel Settings</h3>
        </div>
        <form action="{{ route('admin.settings') }}" method="POST">
          <div class="box-body">
            <div class="row">
              <div class="form-group col-md-4">
                <label class="control-label">Company Name</label>
                <div>
                  <input type="text" class="form-control" name="app:name"
                    value="{{ old('app:name', config('app.name')) }}" />
                  <p class="text-muted"><small>This is the name that is used throughout the panel and in emails sent to
                    clients.</small></p>
                </div>
              </div>
              <div class="form-group col-md-4">
                <label class="control-label">Require 2-Factor Authentication</label>
                <div>
                  <div class="btn-group" data-toggle="buttons">
                    @php
                      $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                    @endphp
                    <label class="btn btn-primary @if ($level == 0) active @endif">
                      <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> Not Required
                    </label>
                    <label class="btn btn-primary @if ($level == 1) active @endif">
                      <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> Admin Only
                    </label>
                    <label class="btn btn-primary @if ($level == 2) active @endif">
                      <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> All Users
                    </label>
                  </div>
                  <p class="text-muted"><small>If enabled, any account falling into the selected grouping will be required
                    to have 2-Factor authentication enabled to use the Panel.</small></p>
                </div>
              </div>
              <div class="form-group col-md-4">
                <label class="control-label">Default Language</label>
                <div>
                  <select name="app:locale" class="form-control">
                    @foreach($languages as $key => $value)
                      <option value="{{ $key }}" @if(config('app.locale') === $key) selected @endif>{{ $value }}</option>
                    @endforeach
                  </select>
                  <p class="text-muted"><small>The default language to use when rendering UI components.</small></p>
                </div>
              </div>
            </div>
          </div>
          <div class="box-footer">
            {!! csrf_field() !!}
            <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  {{-- Announcement Settings --}}
  <div class="row">
    <div class="col-xs-12">
      <div class="box">
        <div class="box-header with-border">
          <h3 class="box-title">Announcement Settings</h3>
        </div>
        <form action="{{ route('admin.announcement.update') }}" method="POST">
          <div class="box-body">
            {!! csrf_field() !!}
            <div class="form-group">
              <label>Icon</label>
              <input type="text" class="form-control" name="icon" value="{{ old('icon', $announcement['icon'] ?? '🎉') }}">
            </div>
            <div class="form-group">
              <label>Title</label>
              <input type="text" class="form-control" name="title" value="{{ old('title', $announcement['title'] ?? '') }}">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="form-control" name="description">{{ old('description', $announcement['description'] ?? '') }}</textarea>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select class="form-control" name="type">
                <option value="info" @if(($announcement['type'] ?? '') === 'info') selected @endif>Info</option>
                <option value="success" @if(($announcement['type'] ?? '') === 'success') selected @endif>Success</option>
                <option value="warning" @if(($announcement['type'] ?? '') === 'warning') selected @endif>Warning</option>
                <option value="danger" @if(($announcement['type'] ?? '') === 'danger') selected @endif>Danger</option>
              </select>
            </div>
          </div>
          <div class="box-footer">
            <button type="submit" class="btn btn-sm btn-primary pull-right">Update Announcement</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  {{-- Logo Settings --}}
  <div class="row">
    <div class="col-xs-12">
      <div class="box">
        <div class="box-header with-border">
          <h3 class="box-title">Logo Settings</h3>
        </div>
        <form action="{{ route('admin.logo.update') }}" method="POST">
          <div class="box-body">
            {!! csrf_field() !!}
            <div class="form-group">
              <label>Logo URL</label>
              <input type="text" class="form-control" name="logo" value="{{ old('logo', $logo ?? '/images/default-logo.png') }}">
              <p class="text-muted"><small>Paste the URL to your logo image. Example: /images/my-logo.png</small></p>
            </div>
          </div>
          <div class="box-footer">
            <button type="submit" class="btn btn-sm btn-primary pull-right">Update Logo</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  {{-- Accent Color Settings --}}
  <div class="row">
    <div class="col-xs-12">
      <div class="box">
        <div class="box-header with-border">
          <h3 class="box-title">Accent Color Settings</h3>
        </div>
        <form action="{{ route('admin.accent.update') }}" method="POST">
          <div class="box-body">
            {!! csrf_field() !!}
            <div class="form-group">
              <label>Accent Color</label>
              <input type="text" class="form-control" name="accent" value="{{ old('accent', $accent ?? '#10b981') }}">
              <p class="text-muted"><small>Enter a hex color (e.g. <code>#10b981</code>) or a valid CSS color value for your panel accent.</small></p>
            </div>
          </div>
          <div class="box-footer">
            <button type="submit" class="btn btn-sm btn-primary pull-right">Update Accent Color</button>
          </div>
        </form>
      </div>
    </div>
</div>


@endsection