import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/toast/toast.component';
import { ActivityService } from './core/services/activity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    @if (auth.isLoggedIn()) {
      <div class="page-layout">
        <nav class="sidebar">
          <div class="sidebar-brand">
            <span class="material-icons">analytics</span>
            <span>IONORA</span>
          </div>
          <ul class="sidebar-nav">
            <li>
              <a routerLink="/upload" routerLinkActive="active">
                <span class="material-icons">upload_file</span>
                Upload Records
              </a>
            </li>
            <li>
              <a routerLink="/search" routerLinkActive="active">
                <span class="material-icons">search</span>
                Search
              </a>
            </li>
            <li>
              <a routerLink="/dashboard" routerLinkActive="active">
                <span class="material-icons">dashboard</span>
                Dashboard
              </a>
            </li>
          </ul>
          <div class="sidebar-footer">
            <div class="user-info">
              <span class="material-icons">account_circle</span>
              <div>
                <div class="user-name">{{ auth.currentUser()?.name }}</div>
                <div class="user-role">{{ auth.currentUser()?.role }}</div>
              </div>
            </div>
            <button class="btn-logout" (click)="auth.logout()">
              <span class="material-icons">logout</span>
            </button>
          </div>
        </nav>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: [`
    .sidebar-brand {
      display: flex; align-items: center; gap: 10px;
      padding: 20px 16px; color: #fff; font-size: 16px; font-weight: 700;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      .material-icons { color: #60a5fa; font-size: 24px; }
    }
    .sidebar-nav {
      list-style: none; padding: 12px 0; flex: 1;
      li a {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 16px; color: rgba(255,255,255,0.7);
        font-size: 14px; font-weight: 500; transition: all 0.15s;
        text-decoration: none;
        .material-icons { font-size: 20px; }
        &:hover { color: #fff; background: rgba(255,255,255,0.08); }
        &.active { color: #fff; background: rgba(96,165,250,0.2); border-right: 3px solid #60a5fa; }
      }
    }
    .sidebar-footer {
      padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: space-between;
    }
    .user-info {
      display: flex; align-items: center; gap: 8px;
      .material-icons { color: rgba(255,255,255,0.5); font-size: 28px; }
      .user-name { color: #fff; font-size: 13px; font-weight: 500; }
      .user-role { color: rgba(255,255,255,0.5); font-size: 11px; text-transform: capitalize; }
    }
    .btn-logout {
      background: none; border: none; cursor: pointer; padding: 6px;
      color: rgba(255,255,255,0.5); border-radius: 6px;
      &:hover { color: #fff; background: rgba(255,255,255,0.1); }
      .material-icons { font-size: 20px; display: block; }
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(public auth: AuthService, private activity: ActivityService) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.activity.start();
    }
  }
}
