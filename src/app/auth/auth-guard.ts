// auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { User } from '../services/user';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(User);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // user is logged in → allow route
    return true;
  } else {
    // user not logged in → redirect to login page
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};
