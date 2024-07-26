import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  endpoint = environment.apiEndpoint;
  userId: string | undefined;

  constructor(private http: HttpClient, private auth: AuthService) {
    // Existing constructor code
  }
  get isAuthenticated$() {
    // return this.auth.isAuthenticated$;
    return this.auth.user$.subscribe((user) => {
      console.log('user', user);
      if (user) {
        // Extract the user_id from the user profile
        this.userId = user.sub;
        console.log('User ID:', this.userId);
      }
    });
  }
  // @d-p35: This function returns the user id
  getUserId(): Observable<string> {
    return this.auth.user$.pipe(map((user) => user?.sub ?? 'Unknown UID'));
  }

  getUserEmail(): Observable<string> {
    return this.auth.user$.pipe(map((user) => user?.email ?? 'Unknown Email'));
  }
  /**
   * HttpClient has methods for all the CRUD actions: get, post, put, patch, delete, and head.
   * First parameter is the URL, and the second parameter is the body.
   * You can use this as a reference for how to use HttpClient.
   * @param content The content of the message
   * @returns
   */
  //   addMessage(content: string): Observable<Message> {
  //     return this.http.post<Message>(this.endpoint + '/api/messages', {
  //       content,
  //     });
  //   }

  createUser(userId: string, email: string): Observable<any> {
    return this.http.post(this.endpoint + '/api/users', { userId, email });
  }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(this.endpoint + '/api/documents', formData);
  }

  getDocuments(
    cursor?: String,
    rows?: number,
    userId?: string,
    folderName?: string
  ): Observable<any> {
    cursor = cursor ?? '';
    rows = rows ?? 10;
    folderName = folderName ?? '';
    return this.http.get(
      `${this.endpoint}/api/documents?cursor=${cursor}&rows=${rows}&userId=${userId}&categoryName=${folderName}`
    );
  }
  getRecentDocuments(
    cursor?: String,
    rows?: number,
    userId?: string
  ): Observable<any> {
    cursor = cursor ?? '';
    rows = rows ?? 10;
    userId = userId ?? '';
    return this.http.get(
      this.endpoint +
        `/api/documents/recent?userId=${userId}&&cursor=${cursor}&rows=${rows}`
    );
  }

  getDocument(documentId: number, userId: String): Observable<any> {
    return this.http.get(
      this.endpoint + `/api/documents/${documentId}?userId=${userId}`
    );
  }

  deleteDocument(documentId: number, userId: String): Observable<any> {
    return this.http.delete(
      this.endpoint + `/api/documents/${documentId}?userId=${userId}`
    );
  }

  getFile(documentId: number, userId: String): Observable<Blob> {
    return this.http.get(
      this.endpoint + `/api/documents/${documentId}/file?userId=${userId}`,
      {
        responseType: 'blob',
      }
    );
  }

  updateLastOpened(documentId: number, userId: String): Observable<any> {
    return this.http.patch(
      this.endpoint +
        `/api/documents/lastOpened/${documentId}?userId=${userId}`,
      { time: new Date().toISOString() }
    );
  }

  searchDocuments(query: string, userId: string): Observable<any> {
    return this.http.get(
      `${this.endpoint}/api/documents/search?q=${query}&userId=${userId}`
    );
  }

  changeCategory(
    documentId: number,
    category: string,
    userId: String
  ): Observable<any> {
    return this.http.patch(
      this.endpoint + `/api/documents/category/${documentId}?userId=${userId}`,
      { category }
    );
  }

  starDocument(documentId: number, starred: boolean, userId: String | undefined): Observable<any> {
    return this.http.patch(
      this.endpoint + `/api/documents/starred/${documentId}/file`,
      { starred, userId}
    );
  }

  getStarredDocuments(
    cursor?: String,
    rows?: number,
    userId?: string
  ): Observable<any> {
    cursor = cursor ?? '';
    rows = rows ?? 10;
    userId = userId ?? '';
    return this.http.get(
      this.endpoint +
        `/api/documents/star?userId=${userId}&&cursor=${cursor}&rows=${rows}`
    );
  }

  // Get documents shared with the user
  getSharedDocuments(
    cursor?: String,
    rows?: number,
    email?: string
  ): Observable<any> {
    cursor = cursor ?? '';
    rows = rows ?? 10;
    email = email ?? '';
    return this.http.get(
      `${this.endpoint}/api/documents/shared?userId=${email}&&cursor=${cursor}&rows=${rows}`
    );
  }

  // Share a document with another user
  shareDocument(
    documentId: number,
    email: string,
    accessLevel: string
  ): Observable<any> {
    return this.http.post(
      `${this.endpoint}/api/documents/${documentId}/share`,
      { email, accessLevel }
    );
  }

  // Get permissions for a document
  getDocumentPermissions(documentId: number): Observable<any> {
    return this.http.get(
      `${this.endpoint}/api/documents/${documentId}/permissions`
    );
  }

  // Remove a permission from a document
  removeDocumentPermission(
    documentId: number,
    email: string
  ): Observable<any> {
    return this.http.delete(
      `${this.endpoint}/api/documents/${documentId}/share`,
      { body: { userId: email } }
    );
  }

  editKeyInfo(
    documentId: number,
    key: string,
    newValue: string,
    userId: string | undefined
  ): Observable<any> {
    userId = userId ?? '';
    return this.http.put(
      `${this.endpoint}/api/documents/${documentId}/key-info`,
      { key, newValue, userId}
    );
  }
}
