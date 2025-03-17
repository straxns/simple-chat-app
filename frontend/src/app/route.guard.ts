import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserService } from './services/user.service';

export const routeGuard: CanMatchFn = (route, segments) => {
  const userService = inject(UserService);
  const router= inject(Router);
  const userStatus = userService.checkUser();
  if(userStatus) return userStatus;
  router.navigate(['']);
  return userService.checkUser();
};
