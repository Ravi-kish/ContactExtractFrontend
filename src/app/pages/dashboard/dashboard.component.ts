import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UploadService, UploadBatch } from '../../core/services/upload.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Upload Dashboard</h1>
      <p>Manage all telecom record upload batches</p>
    </div>

    <div class="page-body">
      <!-- Stats Row -->
      <div class="stats-row mb-4">
        <div class="stat-card">
          <span class="material-icons">upload</span>
          <div>
            <div class="stat-num">{{ totalUploads }}</div>
            <div class="stat-label">Total Uploads</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-icons">table_rows</span>
          <div>
            <div class="stat-num">{{ totalRecords | number }}</div>
            <div class="stat-label">Total Records</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-icons">check_circle</span>
          <div>
            <div class="stat-num">{{ completeUploads }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="material-icons">pending</span>
          <div>
            <div class="stat-num">{{ processingUploads }}</div>
            <div class="stat-label">Processing</div>
          </div>
        </div>
      </div>

      <!-- Uploads Table -->
      <div class="card">
        <div class="card-header">
          <h3>Upload Batches</h3>
          <a routerLink="/upload" class="btn btn-primary btn-sm">
            <span class="material-icons">add</span> New Upload
          </a>
        </div>

        @if (loading) {
          <div class="card-body">
            @for (i of [1,2,3]; track i) {
              <div class="skeleton" style="height:48px;margin-bottom:8px;"></div>
            }
          </div>
        } @else if (uploads.length === 0) {
          <div class="empty-state">
            <span class="material-icons">inbox</span>
            <h3>No uploads yet</h3>
          <p>Upload records to get started</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Upload ID</th>
                  <th>Date</th>
                  <th>Files</th>
                  <th>Records</th>
                  <th>Errors</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (batch of uploads; track batch.id) {
                  <tr>
                    <td><code class="text-xs">{{ batch.id.slice(0, 8) }}...</code></td>
                    <td>{{ batch.created_at | date:'dd MMM yyyy HH:mm' }}</td>
                    <td>{{ batch.file_count }}</td>
                    <td>{{ batch.record_count | number }}</td>
                    <td [class.text-danger]="batch.error_count > 0">{{ batch.error_count }}</td>
                    <td>
                      <span class="badge" [ngClass]="statusBadge(batch.status)">{{ batch.status }}</span>
                    </td>
                    <td class="text-muted">{{ batch.notes || '—' }}</td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-sm btn-secondary" (click)="viewPreview(batch)">
                          <span class="material-icons" style="font-size:14px">visibility</span>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="confirmDelete(batch)">
                          <span class="material-icons" style="font-size:14px">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <button [disabled]="currentPage === 1" (click)="loadPage(currentPage - 1)">
              <span class="material-icons" style="font-size:16px">chevron_left</span>
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button [disabled]="currentPage === totalPages" (click)="loadPage(currentPage + 1)">
              <span class="material-icons" style="font-size:16px">chevron_right</span>
            </button>
          </div>
        }
      </div>
    </div>

    <!-- Preview Modal -->
    @if (previewBatch) {
      <div class="modal-overlay" (click)="previewBatch = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Preview — {{ previewBatch.id.slice(0, 8) }}...</h3>
            <button class="btn btn-icon btn-secondary" (click)="previewBatch = null">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            @if (previewLoading) {
              <div class="skeleton" style="height:200px;"></div>
            } @else {
              <p class="text-sm text-muted mb-4">Showing first {{ previewData.length }} records</p>
              <div class="table-wrapper" style="max-height:400px;overflow-y:auto;">
                <table>
                  <thead>
                    <tr>
                      <th>CDR Number</th><th>B Party</th><th>Name</th>
                      <th>Call Date</th><th>Type</th><th>City</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of previewData; track $index) {
                      <tr>
                        <td>{{ getField(row, 'cdr_number') }}</td>
                        <td>{{ getField(row, 'b_party') }}</td>
                        <td>{{ getField(row, 'name_b_party') }}</td>
                        <td>{{ getField(row, 'call_date') }}</td>
                        <td>{{ getField(row, 'call_type') }}</td>
                        <td>{{ getField(row, 'main_city') }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirm Modal -->
    @if (deleteTarget) {
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this upload batch?</p>
            <div class="delete-info mt-4">
              <div><strong>Upload ID:</strong> <code>{{ deleteTarget.id }}</code></div>
              <div><strong>Records:</strong> {{ deleteTarget.record_count | number }}</div>
              <div><strong>Files:</strong> {{ deleteTarget.file_count }}</div>
            </div>
            <p class="text-danger text-sm mt-4">
              <span class="material-icons" style="font-size:16px;vertical-align:middle">warning</span>
              This will PERMANENTLY delete all {{ deleteTarget.record_count | number }} records and files. This cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger" (click)="doDelete()" [disabled]="deleting">
              @if (deleting) { Deleting... } @else { Delete Batch }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card {
      background: #fff; border: 1px solid var(--gray-200); border-radius: var(--radius);
      padding: 16px 20px; display: flex; align-items: center; gap: 12px;
      box-shadow: var(--shadow);
      .material-icons { font-size: 32px; color: var(--primary); }
      .stat-num { font-size: 24px; font-weight: 700; color: var(--gray-900); }
      .stat-label { font-size: 12px; color: var(--gray-500); }
    }
    .delete-info { background: var(--gray-50); padding: 12px; border-radius: var(--radius);
      div { margin-bottom: 4px; font-size: 13px; }
    }
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class DashboardComponent implements OnInit {
  uploads: UploadBatch[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  totalUploads = 0;
  totalRecords = 0;
  completeUploads = 0;
  processingUploads = 0;

  previewBatch: UploadBatch | null = null;
  previewData: unknown[] = [];
  previewLoading = false;

  deleteTarget: UploadBatch | null = null;
  deleting = false;

  constructor(private uploadService: UploadService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.currentPage = page;

    this.uploadService.getUploads(page, 20).subscribe({
      next: ({ data, pagination }) => {
        this.uploads = data;
        this.totalUploads = pagination.total;
        this.totalPages = Math.ceil(pagination.total / 20);
        this.totalRecords = data.reduce((sum, u) => sum + Number(u.record_count), 0);
        this.completeUploads = data.filter(u => u.status === 'COMPLETE').length;
        this.processingUploads = data.filter(u => u.status === 'PROCESSING' || u.status === 'PENDING').length;
        this.loading = false;
      },
      error: () => { this.toast.error('Failed to load uploads'); this.loading = false; },
    });
  }

  viewPreview(batch: UploadBatch): void {
    this.previewBatch = batch;
    this.previewLoading = true;
    this.previewData = [];

    this.uploadService.getPreview(batch.id).subscribe({
      next: ({ data }) => { this.previewData = data; this.previewLoading = false; },
      error: () => { this.previewLoading = false; this.toast.error('Failed to load preview'); },
    });
  }

  confirmDelete(batch: UploadBatch): void {
    this.deleteTarget = batch;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;

    this.uploadService.deleteUpload(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Upload batch deleted');
        this.deleteTarget = null;
        this.deleting = false;
        this.loadPage(this.currentPage);
      },
      error: () => {
        this.toast.error('Delete failed');
        this.deleting = false;
      },
    });
  }

  getField(row: unknown, field: string): string {
    return (row as Record<string, unknown>)[field] as string || '—';
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      COMPLETE: 'badge-success', PROCESSING: 'badge-info',
      PENDING: 'badge-warning', FAILED: 'badge-danger',
    };
    return map[status] || 'badge-gray';
  }
}
