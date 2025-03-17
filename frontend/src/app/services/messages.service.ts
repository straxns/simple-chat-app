import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message } from '../models/message.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  http = inject(HttpClient);



  getMessages(){
    return this.http.get<Message[]>("http://localhost:5000/api/messages");
  }
  
}
