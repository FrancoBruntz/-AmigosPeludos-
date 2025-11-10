import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import { List } from './page/list/list';
import { Form } from './page/form/form';
import { Details } from './page/details/details';
import { Refugio } from './page/refugio/refugio';
import { Login } from './login/login';
import { Registro } from './component/registro/registro';

export const routes: Routes = [
    {path:'', component: Home},
    {path:'sobreellos', component: List},
    {path:'agregarpets', component: Form},
    {path:'edit/:id', component: Form},
    {path:'details/:id', component: Details},
    {path:'sobrenosotros', component: Refugio},
    {path:'login', component: Login},
    {path:'registro', component: Registro},
    {path: '**', component: Home}
];
