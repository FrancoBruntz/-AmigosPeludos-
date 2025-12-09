import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Como son signals, se usan como funciones:
  if (auth.isLogIn()) {
      return true;
  }
  
  // Si no está logueado → al login
  return router.createUrlTree(['/login']);
};
