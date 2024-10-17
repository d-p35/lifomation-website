import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { environmentProd } from '../../environments/environment.prod';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  endpoint = environment.production
    ? environmentProd.apiEndpoint
    : environment.apiEndpoint;

  userId: string | undefined;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {
    // Existing constructor code
  }
  get isAuthenticated$() {
    // return this.auth.isAuthenticated$;
    return this.auth.user$.subscribe((user) => {
      if (user) {
        // Extract the user_id from the user profile
        this.userId = user.sub;
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
    folderName?: string,
  ): Observable<any> {
    cursor = cursor ?? '';
    rows = rows ?? 10;
    folderName = folderName ?? '';
    return this.http.get(
      `${this.endpoint}/api/documents?cursor=${cursor}&rows=${rows}&categoryName=${folderName}`,
    );
  }
//   getRecentDocuments(
//     cursor?: String,
//     rows?: number,
//   ): Observable<any> {
// }

  getDocument(documentId: number): Observable<any> {
    return this.http.get(
      this.endpoint + `/api/documents/${documentId}`,
    );
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete(
      this.endpoint + `/api/documents/${documentId}`,
    );
  }

  getFile(documentId: number): Observable<Blob> {
    return this.http.get(
      this.endpoint + `/api/documents/${documentId}/file`,
      {
        responseType: 'blob',
      },
    );
  }

  updateLastOpened(documentId: number): Observable<any> {
    return this.http.patch(
      this.endpoint +
        `/api/documents/lastOpened/${documentId}`,
      { time: new Date().toISOString() },
    );
  }

  searchDocuments(query: string, userId: string): Observable<any> {
    return this.http.get(
      `${this.endpoint}/api/documents/search?q=${query}&userId=${userId}`,
    );
  }

  changeCategory(
    documentId: number,
    category: string,
  ): Observable<any> {
    return this.http.patch(
      this.endpoint + `/api/documents/category/${documentId}`,
      { category },
    );
  }

  // starDocument(
  //   documentId: number,
  //   starred: boolean,
  //   userId: String | undefined,
  // ): Observable<any> {
  //   return this.http.patch(
  //     this.endpoint + `/api/documents/starred/${documentId}/file`,
  //     { starred, userId },
  //   );
  // }

  // getStarredDocuments(
  //   cursor?: String,
  //   rows?: number,
  // ): Observable<any> {
  //   cursor = cursor ?? '';
  //   rows = rows ?? 10;
  //   return this.http.get(
  //     this.endpoint +
  //       `/api/documents/star?userId=${userId}&&cursor=${cursor}&rows=${rows}`,
  //   );
  // }

  // Get documents shared with the user


  // Share a document with another user


  // Get permissions for a document

  // Remove a permission from a document

  editKeyInfo(
    documentId: number,
    key: string,
    newValue: string,
    editValue: string,
    editkey: string | null,
  ): Observable<any> {
    editValue = editValue ?? '';
    return this.http.put(
      `${this.endpoint}/api/documents/${documentId}/key-info`,
      { key, newValue, editValue, editkey },
    );
  }
  addKeyInfo(
    documentId: number,
    key: string,
    value: string,
  ): Observable<any> {
    return this.http.post(
      `${this.endpoint}/api/documents/${documentId}/addkey-info`,
      { key, value },
    );
  }
  deleteKeyInfoApi(
    documentId: number,
    key: string,
  ): Observable<any> {
    return this.http.delete(
      `${this.endpoint}/api/documents/${documentId}/delkey-info`,
      { body: { key } },
    );
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.endpoint}/api/users`);
  }
}
