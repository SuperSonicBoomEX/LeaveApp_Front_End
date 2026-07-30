import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Requester } from './pages/requester/requester';
import { Home } from './pages/home/home';
import { RequestForm } from './pages/request-form/request-form';
import { Approver } from './pages/approver/approver';
import { Manager } from './pages/manager/manager';
import { RequestDetails } from './pages/request-details/request-details';
import { ApproveDetails } from './pages/approve-details/approve-details';
import { authGuard } from './guards/auth-guard';
import { ManageDetails } from './pages/manage-details/manage-details';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'requester', component: Requester, canActivate: [authGuard] },
  { path: 'home', component: Home },
  { path: 'request-form', component: RequestForm, canActivate: [authGuard] },
  { path: 'approver', component: Approver, canActivate: [authGuard] },
  { path: 'manager', component: Manager, canActivate: [authGuard] },
  { path: 'request-details/:id', component: RequestDetails, canActivate: [authGuard] },
  { path: 'approve-details/:id', component: ApproveDetails, canActivate: [authGuard] },
  { path: 'manage-details/:id', component: ManageDetails, canActivate: [authGuard] },
];
