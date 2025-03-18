import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message } from '../models/message.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private userService = inject(UserService);
  constructor() {
    this.socket = io('http://localhost:5000', {
      auth: { userId: this.userService.getUser()._id }
    });
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

  userNotFound(): Observable<null> {
    return new Observable((observer) => {
      this.socket.on('userNotFound', () => {
        observer.next(null);
      });
    });
  }

  onUserLeft(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('userLeft', (userId: string) => {
        observer.next(userId);
      });
    });
  }

  markAllMessagesAsSeen() {
    this.socket.emit('markMessageAsSeen');
  }

  onMessagesMarkedAsSeen(): Observable<Message[]> {
    return new Observable((observer) => {
      this.socket.on('messagesMarkedAsSeen', (updatedMessages: Message[]) => {
        observer.next(updatedMessages);
      });
    });
  }
}
