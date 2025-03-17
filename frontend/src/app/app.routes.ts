import { Routes } from '@angular/router';
import { ChatScreenComponent } from './components/chat-screen/chat-screen.component';
import { JoinGuestComponent } from './components/join-guest/join-guest.component';
import { routeGuard } from './route.guard';

export const routes: Routes = [
  {
    path:'',
    component: JoinGuestComponent,
    title: 'CHAT APP'
  },
  {
    path:'chat',
    component: ChatScreenComponent,
    title: 'CHAT APP',
    canMatch: [routeGuard]
  }
];
