import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../core/services/upload.service';
import { ToastService } from '../../core/services/toast.service';

interface FileItem {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Upload Telecom Records</h1>
      <p>Upload CSV or Excel files for processing and analysis</p>
    </div>

    <div class="page-body">
      <div class="upload-layout">
        <!-- Drop Zone -->
        <div class="card">
          <div class="card-header">
            <h3>Select Files</h3>
          </div>
          <div class="card-body">
            <div
              class="drop-zone"
              [class.drag-over]="isDragging"
              [class.has-files]="files.length > 0"
              (dragover)="onDragOver($event)"
              (dragleave)="isDragging = false"
              (drop)="onDrop($event)"
              (click)="fileInput.click()">
              <input #fileInput type="file" multiple accept=".csv,.xlsx,.xls"
                style="display:none" (change)="onFileSelect($event)">
              <span class="material-icons drop-icon">cloud_upload</span>
              <p class="drop-title">Drag & drop CDR files here</p>
              <p class="drop-sub">or click to browse — CSV, XLSX, XLS supported</p>
              <button class="btn btn-secondary mt-2" type="button" (click)="$event.stopPropagation(); fileInput.click()">
                <span class="material-icons">folder_open</span> Browse Files
              </button>
            </div>

            @if (files.length > 0) {
              <div class="file-list mt-4">
                <div class="file-list-header">
                  <span>{{ files.length }} file(s) selected</span>
                  <button class="btn btn-sm btn-secondary" (click)="clearFiles()" [disabled]="uploading">
                    Clear All
                  </button>
                </div>
                @for (item of files; track item.file.name) {
                  <div class="file-item">
                    <span class="material-icons file-icon">
                      {{ item.file.name.endsWith('.csv') ? 'table_chart' : 'grid_on' }}
                    </span>
                    <div class="file-info">
                      <div class="file-name">{{ item.file.name }}</div>
                      <div class="file-size text-muted text-xs">{{ formatSize(item.file.size) }}</div>
                    </div>
                    <span class="badge" [ngClass]="statusBadge(item.status)">{{ item.status }}</span>
                    @if (!uploading) {
                      <button class="btn btn-icon btn-secondary btn-sm" (click)="removeFile(item)">
                        <span class="material-icons" style="font-size:16px">close</span>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Upload Config & Progress -->
        <div>
          <div class="card mb-4">
            <div class="card-header"><h3>Upload Settings</h3></div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Case Reference / Notes (optional)</label>
                <input type="text" class="form-control" placeholder="e.g. Case #2024-001"
                  [(ngModel)]="notes" [disabled]="uploading">
              </div>
              <button class="btn btn-primary w-full btn-lg"
                [disabled]="files.length === 0 || uploading"
                (click)="startUpload()">
                @if (uploading) {
                  <span class="spinner"></span> Uploading...
                } @else {
                  <span class="material-icons">rocket_launch</span>
                  Upload {{ files.length }} File(s)
                }
              </button>
            </div>
          </div>

          @if (uploading || uploadDone) {
            <div class="card">
              <div class="card-header"><h3>Upload Progress</h3></div>
              <div class="card-body">
                <div class="progress-info">
                  <span>Overall Progress</span>
                  <span class="font-semibold">{{ overallProgress }}%</span>
                </div>
                <div class="progress-bar mt-2">
                  <div class="progress-fill" [style.width.%]="overallProgress"></div>
                </div>

                @if (uploadDone && summary) {
                  <div class="summary mt-4">
                    <div class="summary-item success">
                      <span class="material-icons">check_circle</span>
                      <div>
                        <div class="font-semibold">Upload Complete</div>
                        <div class="text-sm text-muted">Files queued for background processing</div>
                      </div>
                    </div>
                    <div class="summary-stats">
                      <div class="stat">
                        <span class="stat-value">{{ summary.files_queued }}</span>
                        <span class="stat-label">Files Queued</span>
                      </div>
                    </div>
                    <div class="text-sm text-muted mt-2">
                      Upload ID: <code>{{ currentUploadId }}</code>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
    .drop-zone {
      border: 2px dashed var(--gray-300); border-radius: var(--radius);
      padding: 48px 24px; text-align: center; cursor: pointer;
      transition: all 0.2s; background: var(--gray-50);
      &:hover, &.drag-over { border-color: var(--primary); background: var(--primary-light); }
      &.has-files { padding: 24px; }
      .drop-icon { font-size: 48px; color: var(--gray-300); }
      .drop-title { font-size: 16px; font-weight: 600; color: var(--gray-700); margin-top: 8px; }
      .drop-sub { color: var(--gray-400); font-size: 13px; margin-top: 4px; }
    }
    .file-list-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px; font-size: 13px; font-weight: 500; color: var(--gray-600);
    }
    .file-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid var(--gray-100);
      &:last-child { border-bottom: none; }
      .file-icon { color: var(--primary); font-size: 20px; }
      .file-info { flex: 1; min-width: 0; }
      .file-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
    .progress-info { display: flex; justify-content: space-between; font-size: 13px; }
    .summary-item {
      display: flex; align-items: center; gap: 10px; padding: 12px;
      background: var(--success-light); border-radius: var(--radius);
      .material-icons { color: var(--success); }
    }
    .summary-stats { display: flex; gap: 16px; margin-top: 12px; }
    .stat { text-align: center;
      .stat-value { display: block; font-size: 24px; font-weight: 700; color: var(--primary); }
      .stat-label { font-size: 11px; color: var(--gray-500); text-transform: uppercase; }
    }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class UploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  files: FileItem[] = [];
  isDragging = false;
  uploading = false;
  uploadDone = false;
  overallProgress = 0;
  notes = '';
  currentUploadId = '';
  summary: { files_queued: number } | null = null;

  constructor(private uploadService: UploadService, private toast: ToastService) {}

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = true;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const dropped = Array.from(e.dataTransfer?.files || []);
    this.addFiles(dropped);
  }

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const selected = Array.from(input.files || []);
    this.addFiles(selected);
    input.value = '';
  }

  addFiles(newFiles: File[]): void {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const skipped: string[] = [];

    for (const f of newFiles) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!allowed.includes(ext)) {
        skipped.push(f.name);
        continue;
      }
      if (!this.files.find(item => item.file.name === f.name)) {
        this.files.push({ file: f, status: 'pending' });
      }
    }

    if (skipped.length > 0) {
      this.toast.warning(`Skipped ${skipped.length} unsupported file(s)`);
    }
  }

  removeFile(item: FileItem): void {
    this.files = this.files.filter(f => f !== item);
  }

  clearFiles(): void {
    this.files = [];
    this.uploadDone = false;
    this.summary = null;
  }

  startUpload(): void {
    if (this.files.length === 0 || this.uploading) return;

    this.uploading = true;
    this.uploadDone = false;
    this.overallProgress = 0;

    this.uploadService.createBatch(this.notes).subscribe({
      next: ({ upload_id }) => {
        this.currentUploadId = upload_id;
        this.uploadFiles(upload_id);
      },
      error: () => {
        this.toast.error('Failed to create upload batch');
        this.uploading = false;
      },
    });
  }

  private uploadFiles(uploadId: string): void {
    const fileList = this.files.map(f => f.file);

    this.uploadService.uploadFiles(uploadId, fileList).subscribe({
      next: ({ progress, done, result }) => {
        this.overallProgress = progress;
        if (done) {
          this.uploading = false;
          this.uploadDone = true;
          this.summary = result as { files_queued: number };
          this.files.forEach(f => f.status = 'done');
          this.toast.success('Files uploaded and queued for processing!');
        }
      },
      error: (err) => {
        this.uploading = false;
        this.toast.error(err.error?.error || 'Upload failed');
        this.files.forEach(f => f.status = 'error');
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-gray', uploading: 'badge-info',
      done: 'badge-success', error: 'badge-danger',
    };
    return map[status] || 'badge-gray';
  }
}
