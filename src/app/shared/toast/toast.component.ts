import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          <span class="material-icons">
            {{ iconMap[toast.type] }}
          </span>
          <span>{{ toast.message }}</span>
          <button class="btn-icon" style="margin-left:auto;background:none;border:none;cursor:pointer;color:inherit;"
            (click)="toastService.dismiss(toast.id)">
            <span class="material-icons" style="font-size:16px">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  iconMap = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
  constructor(public toastService: ToastService) {}
}
