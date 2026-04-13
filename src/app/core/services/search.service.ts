import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface CdrRecord {
  id: number;
  upload_id: string;
  cdr_number: string | null;
  b_party: string | null;
  name_b_party: string | null;
  father_name: string | null;
  permanent_address: string | null;
  call_date: string | null;
  call_time: string | null;
  call_datetime_utc: string | null;
  duration_seconds: number | null;
  call_type: string | null;
  first_cell_id: string | null;
  first_cell_address: string | null;
  last_cell_id: string | null;
  last_cell_address: string | null;
  imei: string | null;
  imsi: string | null;
  roaming: boolean | null;
  circle: string | null;
  operator: string | null;
  main_city: string | null;
  sub_city: string | null;
  latitude: number | null;
  longitude: number | null;
  device_type: string | null;
  device_manufacturer: string | null;
  cdr_name: string | null;
  cdr_address: string | null;
}

export interface SearchResult {
  data: CdrRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
  meta: { query?: string; elapsed_ms: number };
}

export interface AdvancedSearchParams {
  cdr_number?: string;
  b_party?: string;
  name?: string;
  father_name?: string;
  city?: string;
  imei?: string;
  imsi?: string;
  operator?: string;
  circle?: string;
  call_type?: string;
  cell_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private http: HttpClient) {}

  globalSearch(q: string, page = 1, limit = 50): Observable<SearchResult> {
    const params = new HttpParams().set('q', q).set('page', page).set('limit', limit);
    return this.http.get<SearchResult>(`${API}/api/search`, { params });
  }

  advancedSearch(params: AdvancedSearchParams): Observable<SearchResult> {
    return this.http.post<SearchResult>(`${API}/api/search/advanced`, params);
  }

  getRecord(id: number): Observable<CdrRecord> {
    return this.http.get<CdrRecord>(`${API}/api/records/${id}`);
  }

  exportResults(q: string, format: 'csv' | 'xlsx'): Observable<Blob> {
    const params = new HttpParams().set('q', q).set('format', format);
    return this.http.get(`${API}/api/search/export`, { params, responseType: 'blob' });
  }

  exportUrl(q: string, format: 'csv' | 'xlsx'): string {
    const token = localStorage.getItem('cdr_token');
    return `/api/search/export?q=${encodeURIComponent(q)}&format=${format}&token=${token}`;
  }
}
