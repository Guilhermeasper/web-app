import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private http: HttpClient = inject(HttpClient);
  private cachedToken?: string;

  public cacheToken(token: string) {
    this.cachedToken = token;
  }

  public listAppDataFiles() {
    this.ensureAvailableCachedToken();

    const url =
      'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder';
    const headers = this.getAuthorizationHeader();

    return firstValueFrom(this.http.get<FileList>(url, { headers }));
  }

  public downloadFile(fileId: string) {
    this.ensureAvailableCachedToken();

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const headers = this.getAuthorizationHeader();

    return firstValueFrom(
      this.http.get(url, { headers, responseType: 'blob' }),
    );
  }

  public uploadFileToAppData(fileName: string, blob: Blob) {
    this.ensureAvailableCachedToken();

    const url =
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const boundary = 'rusbe_to_google_drive_upload_boundary';

    const metadata = {
      name: fileName,
      mimeType: blob.type,
      parents: ['appDataFolder'],
    };

    const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const mediaPart = `--${boundary}\r\nContent-Type: ${blob.type}\r\n\r\n`;
    const endPart = `\r\n--${boundary}--`;

    const headers = this.getAuthorizationHeader();
    const body = new Blob([metadataPart, mediaPart, blob, endPart], {
      type: `multipart/related; boundary=${boundary}`,
    });

    return firstValueFrom(this.http.post(url, body, { headers }));
  }

  public deleteFile(fileId: string) {
    this.ensureAvailableCachedToken();

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    const headers = this.getAuthorizationHeader();

    return firstValueFrom(this.http.delete(url, { headers }));
  }

  private getAuthorizationHeader() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.cachedToken}`,
    });
  }

  private ensureAvailableCachedToken() {
    if (!this.cachedToken) {
      throw new Error('OperationRequiresCachedToken');
    }
  }
}

export interface FileList {
  files: FileListItem[];
  kind: string;
  incompleteSearch: boolean;
}

export interface FileListItem {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
}
