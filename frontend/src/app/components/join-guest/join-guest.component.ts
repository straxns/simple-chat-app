import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-join-guest',
  imports: [ReactiveFormsModule],
  templateUrl: './join-guest.component.html',
  styleUrl: './join-guest.component.scss'
})
export class JoinGuestComponent implements OnInit {
  userService = inject(UserService);
  loadingStatus: 'not-active' | 'available' | 'pending' | 'unavailable' = 'unavailable'
  private destroyRef = inject(DestroyRef);
  form = new FormGroup({
    user: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50), Validators.minLength(2)]
    }),
  })

  ngOnInit(): void {
    const subscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe({
      next: value => {
        if(value){
          this.userService.checkUsername(value as string);
        } else{
          this.loadingStatus = 'not-active';
        }
      }
    });
    this.destroyRef.onDestroy( () => {
      subscription.unsubscribe();
    });
  }

  onSubmit(){
    this.userService.createUser(this.form.value.user ?? '');
    console.log(this.form.value?.user);
  }
}
