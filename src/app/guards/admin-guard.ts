import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth-service';

export const adminGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

  if (auth.isLogIn() && auth.isAdmin()) {
    return true;
  }

  // Si no es admin, lo mando al home (o donde quieras)
  return router.createUrlTree(['/home']);


};
