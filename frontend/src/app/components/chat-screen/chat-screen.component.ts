import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Message } from '../../models/message.model';
import { MessageComponent } from "../message/message.component";
import { ChatInputComponent } from "../chat-input/chat-input.component";
import { MessagesService } from '../../services/messages.service';
import { User } from '../../models/user.model';
import { SocketService } from '../../services/socket.service';
import { debounceTime, filter, fromEvent, map } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-chat-screen',
  imports: [MessageComponent, ChatInputComponent],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.scss'
})
export class ChatScreenComponent implements OnInit{
  private socketService = inject(SocketService);
  private messagesService =  inject(MessagesService);
  private userService =  inject(UserService);
  private destroyRef = inject(DestroyRef);
  router= inject(Router);
  user = signal<User | undefined>(undefined);
  newMessage = '';
  messages :Message[] = [];

  ngOnInit(): void {
    this.user.set(this.userService.getUser());
    const chatContainer = document.querySelector('article') as HTMLElement;
    this.messagesService.getMessages().subscribe({
      next: (messages) => this.messages = messages
    });

    this.socketService.userNotFound().subscribe(() => {
      this.userService.removeUser();
      this.router.navigate(['chat']);

    });
    this.socketService.onNewMessage().subscribe((message) => {
      this.messages.push(message);
    });

    this.socketService.onMessagesMarkedAsSeen().subscribe((updatedMessages) => {
      this.messages = updatedMessages.map(msg => ({
        ...msg,
        seen: true
      }));
    });

    fromEvent(chatContainer, 'scroll').pipe(
      debounceTime(200),
      map(() => {
        return chatContainer.scrollHeight - chatContainer.scrollTop === chatContainer.clientHeight
      }),
      filter(isAtBottom => isAtBottom)
    ).subscribe(() => {
      if(this.messages[this.messages.length - 1].senderId === this.user()?._id) return;
      this.socketService.markAllMessagesAsSeen();
    });

    this.destroyRef.onDestroy( () => {
      this.socketService.onUserLeft().subscribe((userId) => {
        this.messages = this.messages.filter(
          (msg) => msg.senderId !== userId
        );
      });
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.socketService.sendMessage({
        senderId: this.user()!._id,
        senderName: this.user()!.username,
        content: this.newMessage,
      });
      this.newMessage = '';
    }
  }

}
