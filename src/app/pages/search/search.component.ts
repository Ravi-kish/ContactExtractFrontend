import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, CdrRecord, SearchResult, AdvancedSearchParams } from '../../core/services/search.service';
import { ToastService } from '../../core/services/toast.service';
import { RecordDetailComponent } from './record-detail.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordDetailComponent],
  template: `
    <div class="page-header">
      <h1>Search Records</h1>
      <p>Search across all uploaded telecom data by any field</p>
    </div>

    <div class="page-body">
      <!-- Global Search Bar -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="search-bar">
            <span class="material-icons search-icon">search</span>
            <input
              #searchInput
              type="text" class="search-input"
              placeholder="Search by phone number, name, IMEI, city, operator..."
              [(ngModel)]="globalQuery"
              (keydown.enter)="doSearch()"
              autofocus>
            @if (globalQuery) {
              <button class="clear-btn" (click)="globalQuery=''; doSearch()">
                <span class="material-icons">close</span>
              </button>
            }
            <button class="btn btn-primary" (click)="doSearch()" [disabled]="loading">
              <span class="material-icons">search</span> Search
            </button>
          </div>

          <!-- Advanced Filter Toggle -->
          <div class="advanced-toggle" (click)="showAdvanced = !showAdvanced">
            <span class="material-icons">{{ showAdvanced ? 'expand_less' : 'expand_more' }}</span>
            Advanced Filters
            @if (hasAdvancedFilters()) {
              <span class="badge badge-info">Active</span>
            }
          </div>

          @if (showAdvanced) {
            <div class="advanced-filters">
              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">CDR Number (A-Party)</label>
                  <input type="text" class="form-control" placeholder="Phone number"
                    [(ngModel)]="filters.cdr_number">
                </div>
                <div class="form-group">
                  <label class="form-label">B Party</label>
                  <input type="text" class="form-control" placeholder="B Party number"
                    [(ngModel)]="filters.b_party">
                </div>
                <div class="form-group">
                  <label class="form-label">B Party Internal</label>
                  <input type="text" class="form-control" placeholder="B Party Internal"
                    [(ngModel)]="filters.b_party_internal">
                </div>
                <div class="form-group">
                  <label class="form-label">Name B Party</label>
                  <input type="text" class="form-control" placeholder="Subscriber name"
                    [(ngModel)]="filters.name">
                </div>
                <div class="form-group">
                  <label class="form-label">Father B Party</label>
                  <input type="text" class="form-control" placeholder="Father name"
                    [(ngModel)]="filters.father_name">
                </div>
                <div class="form-group">
                  <label class="form-label">Permanent Address</label>
                  <input type="text" class="form-control" placeholder="Address"
                    [(ngModel)]="filters.permanent_address">
                </div>
                <div class="form-group">
                  <label class="form-label">Main City</label>
                  <input type="text" class="form-control" placeholder="Main city"
                    [(ngModel)]="filters.city">
                </div>
                <div class="form-group">
                  <label class="form-label">Sub City</label>
                  <input type="text" class="form-control" placeholder="Sub city"
                    [(ngModel)]="filters.sub_city">
                </div>
                <div class="form-group">
                  <label class="form-label">Date From</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.date_from">
                </div>
                <div class="form-group">
                  <label class="form-label">Date To</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.date_to">
                </div>
              </div>
              <div class="flex gap-2 mt-2">
                <button class="btn btn-primary" (click)="doAdvancedSearch()">
                  <span class="material-icons">filter_list</span> Apply Filters
                </button>
                <button class="btn btn-secondary" (click)="clearFilters()">
                  Clear Filters
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Results -->
      @if (loading) {
        <div class="card">
          <div class="card-body">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton" style="height:40px;margin-bottom:8px;"></div>
            }
          </div>
        </div>
      } @else if (result) {
        <div class="card">
          <div class="card-header">
            <div class="flex items-center gap-3">
              <h3>Results</h3>
              <span class="badge badge-info">{{ result.pagination.total | number }} records</span>
              @if (result.meta.elapsed_ms) {
                <span class="text-muted text-xs">{{ result.meta.elapsed_ms }}ms</span>
              }
            </div>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" (click)="exportResults('csv')">
                <span class="material-icons">download</span> CSV
              </button>
              <button class="btn btn-secondary btn-sm" (click)="exportResults('xlsx')">
                <span class="material-icons">table_view</span> Excel
              </button>
            </div>
          </div>

          @if (result.data.length === 0) {
            <div class="empty-state">
              <span class="material-icons">search_off</span>
              <h3>No records found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>CdrNo</th>
                    <th>B Party</th>
                    <th>B Party Internal</th>
                    <th>Name B Party</th>
                    <th>Father B Party</th>
                    <th>Permanent Address</th>
                    <th>Date</th>
                    <th>Main City</th>
                    <th>Sub City</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of result.data; track row.id) {
                    <tr (click)="openDetail(row)">
                      <td>{{ row.cdr_number || '—' }}</td>
                      <td>{{ row.b_party || '—' }}</td>
                      <td>{{ row.b_party_internal || '—' }}</td>
                      <td>{{ row.name_b_party || '—' }}</td>
                      <td>{{ row.father_name || '—' }}</td>
                      <td>{{ row.permanent_address || '—' }}</td>
                      <td>{{ formatDate(row.call_date) }}</td>
                      <td>{{ row.main_city || '—' }}</td>
                      <td>{{ row.sub_city || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="pagination">
              <button [disabled]="currentPage === 1" (click)="goToPage(1)">
                <span class="material-icons" style="font-size:16px">first_page</span>
              </button>
              <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
                <span class="material-icons" style="font-size:16px">chevron_left</span>
              </button>
              @for (p of visiblePages(); track p) {
                <button [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
              }
              <button [disabled]="currentPage === result.pagination.pages" (click)="goToPage(currentPage + 1)">
                <span class="material-icons" style="font-size:16px">chevron_right</span>
              </button>
              <button [disabled]="currentPage === result.pagination.pages" (click)="goToPage(result.pagination.pages)">
                <span class="material-icons" style="font-size:16px">last_page</span>
              </button>
              <span>Page {{ currentPage }} of {{ result.pagination.pages }}</span>
              <select class="form-control" style="width:auto;padding:4px 8px;font-size:13px"
                [(ngModel)]="pageSize" (change)="doSearch()">
                <option [value]="50">50/page</option>
                <option [value]="100">100/page</option>
                <option [value]="200">200/page</option>
                <option [value]="500">500/page</option>
              </select>
            </div>
          }
        </div>
      } @else if (searched && !loading) {
        <div class="empty-state card">
          <span class="material-icons">manage_search</span>
          <h3>Enter a search query</h3>
          <p>Search by phone number, name, IMEI, city, or any CDR field</p>
        </div>
      }
    </div>

    <!-- Record Detail Slide-over -->
    @if (selectedRecord) {
      <app-record-detail [record]="selectedRecord" (close)="selectedRecord = null"></app-record-detail>
    }
  `,
  styles: [`
    .search-bar {
      display: flex; align-items: center; gap: 8px;
      border: 2px solid var(--gray-300); border-radius: var(--radius);
      padding: 4px 4px 4px 12px; transition: border-color 0.15s;
      &:focus-within { border-color: var(--primary); }
      .search-icon { color: var(--gray-400); }
      .search-input {
        flex: 1; border: none; outline: none; font-size: 15px;
        color: var(--gray-800); background: transparent;
        &::placeholder { color: var(--gray-400); }
      }
      .clear-btn {
        background: none; border: none; cursor: pointer; color: var(--gray-400);
        padding: 4px; display: flex; align-items: center;
        &:hover { color: var(--gray-600); }
      }
    }
    .advanced-toggle {
      display: flex; align-items: center; gap: 6px; margin-top: 12px;
      color: var(--primary); font-size: 13px; font-weight: 500; cursor: pointer;
      user-select: none;
      &:hover { text-decoration: underline; }
    }
    .advanced-filters {
      margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--gray-200);
    }
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class SearchComponent implements OnInit {
  globalQuery = '';
  showAdvanced = false;
  loading = false;
  searched = false;
  result: SearchResult | null = null;
  selectedRecord: CdrRecord | null = null;
  currentPage = 1;
  pageSize = 50;
  isAdvanced = false;

  filters: AdvancedSearchParams = {};

  constructor(
    private searchService: SearchService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.globalQuery = params['q'];
        this.currentPage = parseInt(params['page'] || '1', 10);
        this.doSearch();
      }
    });
  }

  doSearch(): void {
    if (!this.globalQuery.trim()) return;
    this.isAdvanced = false;
    this.loading = true;
    this.searched = true;

    this.router.navigate([], { queryParams: { q: this.globalQuery, page: this.currentPage }, replaceUrl: true });

    this.searchService.globalSearch(this.globalQuery, this.currentPage, this.pageSize).subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: () => { this.toast.error('Search failed'); this.loading = false; },
    });
  }

  doAdvancedSearch(): void {
    this.isAdvanced = true;
    this.loading = true;
    this.searched = true;
    this.currentPage = 1;

    const params: AdvancedSearchParams = { ...this.filters, page: this.currentPage, limit: this.pageSize };

    this.searchService.advancedSearch(params).subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: () => { this.toast.error('Search failed'); this.loading = false; },
    });
  }

  goToPage(page: number): void {
    if (!this.result) return;
    this.currentPage = page;
    if (this.isAdvanced) {
      this.doAdvancedSearch();
    } else {
      this.doSearch();
    }
  }

  visiblePages(): number[] {
    if (!this.result) return [];
    const total = this.result.pagination.pages;
    const cur = this.currentPage;
    const pages: number[] = [];
    const start = Math.max(1, cur - 2);
    const end = Math.min(total, cur + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  openDetail(record: CdrRecord): void {
    this.selectedRecord = record;
  }

  exportResults(format: 'csv' | 'xlsx'): void {
    if (!this.result || this.result.data.length === 0) return;

    const safeName = (this.globalQuery || 'results').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `ionora_${safeName}_${new Date().toISOString().split('T')[0]}.${format}`;

    // Pass advanced filters if in advanced mode, otherwise pass global query
    const obs = this.isAdvanced
      ? this.searchService.exportResults('', format, { ...this.filters as Record<string, string> })
      : this.searchService.exportResults(this.globalQuery, format);

    obs.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Export failed'),
    });
  }

  hasAdvancedFilters(): boolean {
    return Object.values(this.filters).some(v => v && v !== '');
  }

  clearFilters(): void {
    this.filters = {};
  }

  formatDate(val: string | null): string {
    if (!val) return '—';
    // Handle ISO string or plain date
    return val.split('T')[0];
  }
}
