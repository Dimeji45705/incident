import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { IncidentListComponent } from './components/incidents/incident-list/incident-list.component';
import { IncidentFormComponent } from './components/incidents/incident-form/incident-form.component';
import { IncidentDetailComponent } from './components/incidents/incident-detail/incident-detail.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/incidents', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'incidents', component: IncidentListComponent },
      { path: 'incidents/create', component: IncidentFormComponent },
      { path: 'incidents/:id', component: IncidentDetailComponent },
      {
        path: 'change-requests',
        loadChildren: () => import('./components/change-requests/change-requests.routes').then(m => m.routes)
      },
      {
        path: 'users',
        loadChildren: () => import('./components/users/users.routes').then(m => m.routes)
      }
    ]
  }
];