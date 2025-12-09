import { Routes } from '@angular/router';

import { Home } from './page/home/home';
import { List } from './page/list/list';
import { Form } from './page/form/form';
import { Details } from './page/details/details';
import { Refugio } from './page/refugio/refugio';
import { Login } from './login/login';
import { Registro } from './component/registro/registro';

import { RequestList } from './page/adopcion/request-list/request-list';
import { RequestForm } from './page/adopcion/request-form/request-form';
import { AdminRequest } from './page/adopcion/admin-request/admin-request';
import { RequestDetails } from './page/adopcion/request-details/request-details';
import { AdminUserProfile } from './page/adopcion/admin-user-profile/admin-user-profile';

import { DonationForm } from './component/donations/donation-form/donation-form';
import { DonationList } from './component/donations/donation-list/donation-list';
import { DonationDetails } from './component/donations/donation-details/donation-details';
import { MyDonations } from './component/donations/my-donations/my-donations';

import { ProfileComponent } from './component/user/profile/profile';
import { FavoritesComponent } from './component/user/favorites/favorites';
import { NotificationsComponent } from './component/user/notifications/notifications';

// GUARDS
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { publicGuard } from './guards/public-guard';

export const routes: Routes = [
  // PÚBLICAS
  { path: '', component: Home },
  { path: 'sobrenosotros', component: Refugio },
  { path: 'details/:id', component: Details },

  // LOGIN / REGISTRO → solo si NO está logueado
  { path: 'login', component: Login, canMatch: [publicGuard] },
  { path: 'registro', component: Registro, canMatch: [publicGuard] },

  // RUTAS SOLO LOGUEADOS (USUARIO COMÚN)
  { path: 'mis-solicitudes', component: RequestList, canMatch: [authGuard] },
  { path: 'solicitar/:animalId', component: RequestForm, canMatch: [authGuard] },
  { path: 'solicitudes/:id', component: RequestDetails, canMatch: [authGuard] },

  { path: 'user/profile', component: ProfileComponent, canMatch: [authGuard] },
  { path: 'user/favorites', component: FavoritesComponent, canMatch: [authGuard] },
  { path: 'user/notifications', component: NotificationsComponent, canMatch: [authGuard] },

  { path: 'notifications', component: NotificationsComponent, canMatch: [authGuard] },

  { path: 'donar', component: DonationForm, canMatch: [authGuard] },
  { path: 'mis-donaciones', component: MyDonations, canMatch: [authGuard] },

  // RUTAS SOLO ADMIN
  { path: 'sobreellos', component: List, canMatch: [adminGuard] },
  { path: 'agregarpets', component: Form, canMatch: [adminGuard] },
  { path: 'edit/:id', component: Form, canMatch: [adminGuard] },

  { path: 'admin/solicitudes', component: AdminRequest, canMatch: [adminGuard] },
  { path: 'admin/solicitudes/:id', component: RequestDetails, canMatch: [adminGuard] },

  { path: 'admin/usuarios/:dni', component: AdminUserProfile, canMatch: [adminGuard] },

  { path: 'admin/donaciones', component: DonationList, canMatch: [adminGuard] },
  { path: 'admin/donaciones/:id', component: DonationDetails, canMatch: [adminGuard] },

  // CATCH-ALL
  { path: '**', component: Home }
];
