import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface UploadBatch {
  id: string;
  created_at: string;
  completed_at: string | null;
  file_count: number;
  record_count: number;
  error_count: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  uploader_id: string;
  notes: string | null;
  is_deleted: boolean;
  file_names: string[];
}

export interface FileProgress {
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  createBatch(notes?: string): Observable<{ upload_id: string }> {
    return this.http.post<{ upload_id: string }>('/api/uploads', { notes });
  }

  uploadFiles(uploadId: string, files: File[]): Observable<{ progress: number; done: boolean; result?: unknown }> {
    const subject = new Subject<{ progress: number; done: boolean; result?: unknown }>();
    const formData = new FormData();
    files.forEach(f => formData.append('files', f, f.name));

    this.http.post(`/api/uploads/${uploadId}/files`, formData, {
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          subject.next({ progress, done: false });
        } else if (event.type === HttpEventType.Response) {
          subject.next({ progress: 100, done: true, result: event.body });
          subject.complete();
        }
      },
      error: (err) => subject.error(err),
    });

    return subject.asObservable();
  }

  getUploads(page = 1, limit = 20): Observable<{ data: UploadBatch[]; pagination: { total: number; page: number; limit: number } }> {
    return this.http.get<{ data: UploadBatch[]; pagination: { total: number; page: number; limit: number } }>(
      `/api/uploads?page=${page}&limit=${limit}`
    );
  }

  getUpload(id: string): Observable<UploadBatch> {
    return this.http.get<UploadBatch>(`/api/uploads/${id}`);
  }

  getPreview(id: string): Observable<{ data: unknown[]; count: number }> {
    return this.http.get<{ data: unknown[]; count: number }>(`/api/uploads/${id}/preview`);
  }

  deleteUpload(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/uploads/${id}`);
  }
}
