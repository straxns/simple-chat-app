import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  http = inject(HttpClient);
  createUser(username: string){
    this.http.post('',{username});
  }
  checkUsername(username: string){
    this.http.get('');
  }
}
