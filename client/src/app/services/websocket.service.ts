import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private subject: Subject<any> = new Subject();

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onmessage = (event) => {
      this.subject.next(JSON.parse(event.data));
    };

    this.socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(message: any) {
    this.socket.send(JSON.stringify(message));
  }

  getMessages(): Observable<any> {
    return this.subject.asObservable();
  }
}
