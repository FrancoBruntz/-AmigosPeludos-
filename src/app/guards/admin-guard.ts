import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { UserService } from "../component/user/user.service";

/*
- Guard minimalista: si el usuario actual no es admin, redirige a home 
- Usamos CanMatch para bloquear la coincidencia de la ruta
*/

export const adminGuard: CanMatchFn = () => {
    const user = inject(UserService).getUser() // leemos el perfil actual
    const router = inject(Router);

    // Si hay usuario y es admin , deja pasar, si no, redirige a '/'
    return user?.isAdmin? true : router.parseUrl('/');
}