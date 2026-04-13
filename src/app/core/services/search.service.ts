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
  b_party_internal: string | null;
  name_b_party: string | null;
  father_name: string | null;
  permanent_address: string | null;
  call_date: string | null;
  main_city: string | null;
  sub_city: string | null;
}

export interface SearchResult {
  data: CdrRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
  meta: { query?: string; elapsed_ms: number };
}

export interface AdvancedSearchParams {
  cdr_number?: string;
  b_party?: string;
  b_party_internal?: string;
  name?: string;
  father_name?: string;
  permanent_address?: string;
  city?: string;
  sub_city?: string;
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

  exportResults(q: string, format: 'csv' | 'xlsx', advancedParams?: Record<string, string>): Observable<Blob> {
    if (advancedParams && Object.keys(advancedParams).length > 0) {
      // Advanced search export — POST with full params
      return this.http.post(`${API}/api/search/export`, { ...advancedParams, format }, { responseType: 'blob' });
    }
    // Global search export
    const params = new HttpParams().set('q', q).set('format', format);
    return this.http.get(`${API}/api/search/export`, { params, responseType: 'blob' });
  }
}
