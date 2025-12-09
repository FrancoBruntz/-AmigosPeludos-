import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth-service';

export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si NO está logueado → puede ver login / registro
  if (!auth.isLogIn()) {
    return true;
  }

  // Si ya está logueado → al home
  return router.createUrlTree(['/home']);
};
