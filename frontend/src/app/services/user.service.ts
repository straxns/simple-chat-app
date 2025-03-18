import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  http = inject(HttpClient);
  createUser(username: string){
    return this.http.post<User>('http://localhost:5000/api/users/register-guest',{username});
  }
  checkUsername(username: string){
    return this.http.get<{available: boolean}>(`http://localhost:5000/api/users/check-username?username=${username}`);
  }
  setUser(user: User){
    window.sessionStorage.setItem('user', JSON.stringify(user));
  }
  getUser(): User {
    return JSON.parse(window.sessionStorage.getItem('user') ?? "{}");
  }
  removeUser() {
    window.sessionStorage.removeItem('user')
  }
  checkUser(): boolean{
    return !!this.getUser().username;
  }
}
