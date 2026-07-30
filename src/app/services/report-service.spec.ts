// @vitest-environment jsdom

import '@angular/compiler';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ReportService } from './report-service';

describe('ReportService', () => {
  let service: ReportService;
  let http: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    http = {
      get: vi.fn(),
    };

    service = new ReportService(http as unknown as HttpClient, {} as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call exportPdfForEmployee with correct URL', () => {
    const employeeId = 1;
    const mockBlob = new Blob(['mock data'], { type: 'application/pdf' });
    http.get.mockReturnValue(of(mockBlob));

    service.exportPdfForEmployee(employeeId).subscribe((result) => {
      expect(result).toEqual(mockBlob);
    });

    expect(http.get).toHaveBeenCalledWith(
      `http://localhost:8080/reports/${employeeId}`,
      {
        responseType: 'blob',
        observe: 'body',
      }
    );
  });

  it('should call downloadPdf successfully', () => {
    const mockBlob = new Blob(['mock data'], { type: 'application/pdf' });
    const fileName = 'test-report.pdf';

    // Spy on the createObjectURL and revokeObjectURL methods
    const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL');
    const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL');

    service.downloadPdf(mockBlob, fileName);

    expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('should throw an error if employeeId is not available in downloadMyPdf', () => {
    const mockAuthService = {
      getUserId: vi.fn().mockReturnValue(null),
    };

    service = new ReportService(http as unknown as HttpClient, mockAuthService as any);

    service.downloadMyPdf().subscribe({
      next: () => {
        // This should not be called
        expect(true).toBe(false);
      },
      error: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Unable to resolve the current employee id for PDF export.');
      },
    });
  });

  it('should call exportPdfForEmployee and downloadPdf in downloadMyPdf', () => {
    const employeeId = 1;
    const mockBlob = new Blob(['mock data'], { type: 'application/pdf' });
    const mockAuthService = {
      getUserId: vi.fn().mockReturnValue(employeeId),
    };

    http.get.mockReturnValue(of(mockBlob));

    service = new ReportService(http as unknown as HttpClient, mockAuthService as any);

    // Spy on the downloadPdf method
    const downloadPdfSpy = vi.spyOn(service, 'downloadPdf');

    service.downloadMyPdf().subscribe((result) => {
      expect(result).toEqual(mockBlob);
      expect(downloadPdfSpy).toHaveBeenCalledWith(mockBlob, `leave-report-${employeeId}.pdf`);
    });

    expect(http.get).toHaveBeenCalledWith(
      `http://localhost:8080/reports/${employeeId}`,
      {
        responseType: 'blob',
        observe: 'body',
      }
    );
  });
});
