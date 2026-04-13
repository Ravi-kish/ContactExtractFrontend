import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="material-icons logo-icon">analytics</span>
          <h1>IONORA</h1>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label">User ID</label>
            <input
              type="text" class="form-control" placeholder="Enter your user ID"
              [(ngModel)]="email" name="username" required autocomplete="username" autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-field">
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="form-control" placeholder="Enter password"
                [(ngModel)]="password" name="password" required autocomplete="current-password">
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          @if (error) {
            <div class="alert-error">
              <span class="material-icons">error_outline</span>
              {{ error }}
            </div>
          }

          <button type="submit" class="btn btn-primary w-full btn-lg" [disabled]="loading">
            @if (loading) {
              <span class="spinner"></span> Signing in...
            } @else {
              <span class="material-icons">login</span> Sign In
            }
          </button>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1e3a5f 0%, #1a56db 100%);
      padding: 20px;
    }
    .login-card {
      background: #fff; border-radius: 12px; padding: 40px;
      width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center; margin-bottom: 32px;
      .logo-icon { font-size: 48px; color: var(--primary); }
      h1 { font-size: 20px; font-weight: 700; color: var(--gray-900); margin-top: 8px; }
      p { color: var(--gray-500); font-size: 13px; margin-top: 4px; }
    }
    .password-field { position: relative;
      .form-control { padding-right: 40px; }
      .toggle-pw {
        position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; color: var(--gray-400);
        .material-icons { font-size: 18px; display: block; }
      }
    }
    .alert-error {
      display: flex; align-items: center; gap: 8px;
      background: var(--danger-light); color: var(--danger);
      padding: 10px 12px; border-radius: var(--radius); margin-bottom: 16px; font-size: 13px;
      .material-icons { font-size: 18px; }
    }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .login-hint {
      margin-top: 24px; padding: 12px; background: var(--gray-50);
      border-radius: var(--radius); text-align: center;
      p { font-size: 12px; color: var(--gray-500); margin-bottom: 4px; }
      code { font-size: 12px; color: var(--gray-700); }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate(['/search']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
        this.loading = false;
      },
    });
  }
}
