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
import { NotificationsComponent } from './component/user/notifications/notifications';
import { adminGuard } from './guards/admin-guard';
import { DonationForm } from './component/donations/donation-form/donation-form';
import { DonationList } from './component/donations/donation-list/donation-list';
import { DonationDetails } from './component/donations/donation-details/donation-details';

export const routes: Routes = [
    {path:'', component: Home},
    {path:'sobreellos', component: List},
    {path:'agregarpets', component: Form},
    {path:'edit/:id', component: Form},
    {path:'details/:id', component: Details},
    {path:'sobrenosotros', component: Refugio},
    {path:'login', component: Login},
    {path:'registro', component: Registro},
    {path:'mis-solicitudes', component: RequestList},
    {path:'solicitar/:animalId', component: RequestForm},
    {path:'admin/solicitudes', component: AdminRequest, canMatch: [adminGuard] },
    {path:'notifications', component: NotificationsComponent},
    {path: 'donar' , component: DonationForm},
    {path: 'mis-donaciones', component: DonationList}, //?????
    {path: 'admin/donaciones', component: DonationList},
    {path: 'admin/donaciones/:id', component: DonationDetails},
    {path: '**', component: Home}
];
