import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { debounceTime, Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-guest',
  imports: [ReactiveFormsModule],
  templateUrl: './join-guest.component.html',
  styleUrl: './join-guest.component.scss'
})
export class JoinGuestComponent implements OnInit, AfterViewInit {
  userService = inject(UserService);
  router= inject(Router);
  isLoadingCheckUsername = signal<boolean>(false);
  availableName = signal<boolean | undefined>(undefined);
  private destroyRef = inject(DestroyRef);
  form = new FormGroup({
    user: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50), Validators.minLength(2)]
    }),
  })

  ngOnInit(): void {
    this.userService.checkUser();
    let subscriptionCheckUsername: Subscription | undefined;
    const subscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe({
      next: value => {
        if(!value) {
          this.availableName.set(undefined);
          return;
        }
        this.isLoadingCheckUsername.set(true);
        subscriptionCheckUsername = this.userService.checkUsername(value.user ?? '').subscribe({
          next: (usernameAvailable) => {
            this.availableName.set(usernameAvailable.available)
            console.log(usernameAvailable);
          },
          complete:() => this.isLoadingCheckUsername.set(false)
        })
      }
    });
    this.destroyRef.onDestroy( () => {
      subscription.unsubscribe();
      subscriptionCheckUsername?.unsubscribe();
    });
  }

  ngAfterViewInit(): void {;
    let user: User = this.userService.getUser()
    if(user.username) this.router.navigate(['chat']);
  }


  onSubmit(){
    this.userService.createUser(this.form.value.user ?? '').subscribe({
      next: (data) =>{
         this.userService.setUser(data);
         this.router.navigate(['chat']);
        }
    });

  }
}
