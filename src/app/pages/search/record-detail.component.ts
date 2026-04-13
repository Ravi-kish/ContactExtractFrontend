import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdrRecord, SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-record-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slideover-overlay" (click)="close.emit()"></div>
    <div class="slideover">
      <div class="slideover-header">
        <h3>CDR Record Detail</h3>
        <button class="btn btn-icon btn-secondary" (click)="close.emit()">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="slideover-body">
        @if (fullRecord) {
          <div class="detail-section">
            <h4>Call Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">CDR Number (A-Party)</span>
                <span class="detail-value">{{ fullRecord.cdr_number || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">B-Party Number</span>
                <span class="detail-value">{{ fullRecord.b_party || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Call Date</span>
                <span class="detail-value">{{ fullRecord.call_date || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Call Time</span>
                <span class="detail-value">{{ fullRecord.call_time || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">{{ formatDuration(fullRecord.duration_seconds) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Call Type</span>
                <span class="detail-value">{{ fullRecord.call_type || '—' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Subscriber Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Name (B-Party)</span>
                <span class="detail-value">{{ fullRecord.name_b_party || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Father's Name</span>
                <span class="detail-value">{{ fullRecord.father_name || '—' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Permanent Address</span>
                <span class="detail-value">{{ fullRecord.permanent_address || '—' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Device & Network</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">IMEI</span>
                <span class="detail-value mono">{{ fullRecord.imei || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">IMSI</span>
                <span class="detail-value mono">{{ fullRecord.imsi || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Operator</span>
                <span class="detail-value">{{ fullRecord.operator || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Circle</span>
                <span class="detail-value">{{ fullRecord.circle || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Roaming</span>
                <span class="detail-value">{{ fullRecord.roaming === null ? '—' : fullRecord.roaming ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Device Type</span>
                <span class="detail-value">{{ fullRecord.device_type || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Manufacturer</span>
                <span class="detail-value">{{ fullRecord.device_manufacturer || '—' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Location</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Main City</span>
                <span class="detail-value">{{ fullRecord.main_city || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Sub City</span>
                <span class="detail-value">{{ fullRecord.sub_city || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">First Cell ID</span>
                <span class="detail-value mono">{{ fullRecord.first_cell_id || '—' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">First Cell Address</span>
                <span class="detail-value">{{ fullRecord.first_cell_address || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Cell ID</span>
                <span class="detail-value mono">{{ fullRecord.last_cell_id || '—' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Last Cell Address</span>
                <span class="detail-value">{{ fullRecord.last_cell_address || '—' }}</span>
              </div>
              @if (fullRecord.latitude) {
                <div class="detail-item">
                  <span class="detail-label">Coordinates</span>
                  <span class="detail-value mono">{{ fullRecord.latitude }}, {{ fullRecord.longitude }}</span>
                </div>
              }
            </div>
          </div>

          <div class="detail-section">
            <h4>CDR File Info</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">CDR Name</span>
                <span class="detail-value">{{ fullRecord.cdr_name || '—' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">CDR Address</span>
                <span class="detail-value">{{ fullRecord.cdr_address || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Upload ID</span>
                <span class="detail-value mono text-xs">{{ fullRecord.upload_id }}</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="loading-detail">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton" style="height:80px;margin-bottom:16px;border-radius:8px;"></div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-section {
      margin-bottom: 24px;
      h4 { font-size: 13px; font-weight: 600; color: var(--gray-500); text-transform: uppercase;
        letter-spacing: 0.05em; margin-bottom: 12px; padding-bottom: 6px;
        border-bottom: 1px solid var(--gray-200); }
    }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-item {
      &.full-width { grid-column: 1 / -1; }
      .detail-label { display: block; font-size: 11px; font-weight: 500; color: var(--gray-400);
        text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
      .detail-value { font-size: 14px; color: var(--gray-800); word-break: break-all; }
      .mono { font-family: monospace; font-size: 13px; }
    }
  `]
})
export class RecordDetailComponent implements OnInit {
  @Input() record!: CdrRecord;
  @Output() close = new EventEmitter<void>();

  fullRecord: CdrRecord | null = null;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.getRecord(this.record.id).subscribe({
      next: (r) => this.fullRecord = r,
      error: () => this.fullRecord = this.record,
    });
  }

  formatDuration(secs: number | null): string {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
}
