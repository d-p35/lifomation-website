import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // endpoint = 'http://localhost:3000';
  endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {}
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

uploadDocument(formData: FormData): Observable<any> {
  return this.http.post(this.endpoint + '/api/documents', formData);
}

getDocuments(): Observable<any> {
  return this.http.get(this.endpoint + '/api/documents');
}

deleteDocument(documentId: number): Observable<any> {
  return this.http.delete(this.endpoint + `/api/documents/${documentId}`);
}

//   deleteMessage(messageId: number): Observable<Message> {
//     return this.http.delete<Message>(
//       this.endpoint + `/api/messages/${messageId}`,
//     );
//   }

//   upvoteMessage(messageId: number) {
//     return this.http.patch<Message>(
//       this.endpoint + `/api/messages/${messageId}`,
//       { action: 'upvote' },
//     );
//   }

//   downvoteMessage(messageId: number) {
//     return this.http.patch<Message>(
//       this.endpoint + `/api/messages/${messageId}`,
//       { action: 'downvote' },
//     );
//   }

//   getMessages(): Observable<{ messages: Message[] }> {
//     return this.http.get<{ messages: Message[] }>(
//       this.endpoint + `/api/messages`,
//     );
//   }

//   signIn(username: string, password: string): Observable<any> {
//     return this.http.post(this.endpoint + '/api/users/signin', {
//       username,
//       password,
//     });
//   }

//   signUp(username: string, password: string): Observable<any> {
//     return this.http.post(this.endpoint + '/api/users/signup', {
//       username,
//       password,
//     });
//   }

//   signOut(): Observable<any> {
//     return this.http.get(this.endpoint + '/api/users/signout');
//   }

//   me(): Observable<any> {
//     return this.http.get(this.endpoint + '/api/users/me');
//   }
}