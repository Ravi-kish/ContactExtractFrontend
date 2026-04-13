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
        <h3>Record Detail</h3>
        <button class="btn btn-icon btn-secondary" (click)="close.emit()">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="slideover-body">
        @if (fullRecord) {
          <div class="detail-section">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">CdrNo (A-Party)</span>
                <span class="detail-value">{{ fullRecord.cdr_number || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">B Party</span>
                <span class="detail-value">{{ fullRecord.b_party || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">B Party Internal</span>
                <span class="detail-value">{{ fullRecord.b_party_internal || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Name B Party</span>
                <span class="detail-value">{{ fullRecord.name_b_party || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Father B Party</span>
                <span class="detail-value">{{ fullRecord.father_name || '—' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Permanent Address B Party</span>
                <span class="detail-value">{{ fullRecord.permanent_address || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ fullRecord.call_date ? fullRecord.call_date.split('T')[0] : '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Main City (First CellID)</span>
                <span class="detail-value">{{ fullRecord.main_city || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Sub City (First CellID)</span>
                <span class="detail-value">{{ fullRecord.sub_city || '—' }}</span>
              </div>
            </div>
          </div>
        } @else {
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height:60px;margin-bottom:12px;border-radius:8px;"></div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-section { margin-bottom: 24px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-item {
      &.full-width { grid-column: 1 / -1; }
      .detail-label { display: block; font-size: 11px; font-weight: 600; color: var(--gray-400);
        text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
      .detail-value { font-size: 14px; color: var(--gray-800); word-break: break-word; }
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
}
