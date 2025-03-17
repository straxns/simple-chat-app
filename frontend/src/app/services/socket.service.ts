import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  constructor() {
    this.socket = io('http://localhost:5000');
  }

  sendMessage(message: { senderId: string; senderName: string; content: string }) {
    this.socket.emit('sendMessage', message);
  }
  onNewMessage(): Observable<Message> {
    return new Observable((observer) => {
      this.socket.on('newMessage', (message: Message) => {
        observer.next(message);
      });
    });
  }


  setUserId(userId: string) {
    this.socket.emit('setUserId', userId);
  }

  onUserLeft(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('userLeft', (userId: string) => {
        observer.next(userId);
      });
    });
  }
}
