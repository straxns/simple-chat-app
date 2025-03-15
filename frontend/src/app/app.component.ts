import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JoinGuestComponent } from "./components/join-guest/join-guest.component";

@Component({
  selector: 'app-root',
  imports: [ JoinGuestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
