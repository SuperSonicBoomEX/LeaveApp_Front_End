import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, tap } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}
  
  private readonly apiUrl = 'http://localhost:8080/reports';

  exportPdfForEmployee(employeeId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${employeeId}`, {
      responseType: 'blob',
      observe: 'body',
    });
  }

  downloadPdf(blob: Blob, fileName = 'leave-report.pdf'): void {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(objectUrl);
  }

  downloadMyPdf(): Observable<Blob> {
    const employeeId = this.authService.getUserId();

    if (!employeeId) {
      return throwError(() => new Error('Unable to resolve the current employee id for PDF export.'));
    }

    return this.exportPdfForEmployee(employeeId).pipe(
      tap((blob) => this.downloadPdf(blob, `leave-report-${employeeId}.pdf`))
    );
  }
}
