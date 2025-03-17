import { Component, inject, OnInit, signal } from '@angular/core';
import { Message } from '../../models/message.model';
import { MessageComponent } from "../message/message.component";
import { ChatInputComponent } from "../chat-input/chat-input.component";
import { MessagesService } from '../../services/messages.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-chat-screen',
  imports: [MessageComponent, ChatInputComponent],
  templateUrl: './chat-screen.component.html',
  styleUrl: './chat-screen.component.scss'
})
export class ChatScreenComponent implements OnInit{
  private userService = inject(UserService);
  private socketService = inject(SocketService);
  private messagesService =  inject(MessagesService);
  user?: User;
  newMessage = '';
  messages :Message[] = [];

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.messagesService.getMessages().subscribe({
      next: (messages) => this.messages = messages
    });
    this.socketService.setUserId(this.user._id);
    this.socketService.onNewMessage().subscribe((message) => {
      this.messages.push(message);
    });
    this.socketService.onUserLeft().subscribe((userId) => {
      this.messages = this.messages.filter(
        (msg) => msg.senderId !== userId
      );
    });
  }

  sendMessage() {
    console.log({
      senderId: this.user!._id,
      senderName: this.user!.username,
      content: this.newMessage,
    });
    if (this.newMessage.trim()) {
      this.socketService.sendMessage({
        senderId: this.user!._id,
        senderName: this.user!.username,
        content: this.newMessage,
      });
      this.newMessage = '';
    }
  }
}
