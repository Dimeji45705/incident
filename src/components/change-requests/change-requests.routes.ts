import { Routes } from '@angular/router';
import { ChangeRequestListComponent } from './change-request-list/change-request-list.component';
import { ChangeRequestFormComponent } from './change-request-form/change-request-form.component';
import { ChangeRequestDetailComponent } from './change-request-detail/change-request-detail.component';

export const routes: Routes = [
  { path: '', component: ChangeRequestListComponent },
  { path: 'create', component: ChangeRequestFormComponent },
  { path: ':id', component: ChangeRequestDetailComponent },
  { path: ':id/edit', component: ChangeRequestFormComponent }
];