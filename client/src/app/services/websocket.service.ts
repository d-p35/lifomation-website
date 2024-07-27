import { Injectable, NgZone } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | undefined;
  private messagesSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private ngZone: NgZone, private auth: AuthService, private apiS: ApiService) {
    this.apiS.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.connect(userId);

  }});
  }


  connect(userId: string) {
    this.socket = new WebSocket(environment.production ?'ws://server.lifomation.tech':'ws://localhost:3000'); // Use your backend URL

    this.socket.onopen = () => {
      if (!this.socket) return;
      this.socket.send(JSON.stringify({ type: 'init', userId }));
    };

    this.socket.onmessage = (event) => {
      if (!this.socket) return;
      this.ngZone.run(() => {
        this.messagesSubject.next(JSON.parse(event.data));
      });
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connect(userId), 1000);
    };
  }

  sendMessage(message: any) {
    if (!this.socket) return;
    this.socket.send(JSON.stringify(message));
  }

}
