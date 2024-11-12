import { Routes } from '@angular/router';

import {
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { canActivate } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['account/login']);
const redirectLoggedInToAccountDetails = () =>
  redirectLoggedInTo(['account/details']);

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomePageComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./pages/menu/menu.component').then((m) => m.MenuPageComponent),
  },
  {
    path: 'operation',
    loadComponent: () =>
      import('./pages/operation/operation.component').then(
        (m) => m.OperationPageComponent,
      ),
  },
  {
    path: 'account/login',
    loadComponent: () =>
      import('./pages/account/login/login.component').then(
        (m) => m.AccountLoginPageComponent,
      ),
    ...canActivate(redirectLoggedInToAccountDetails),
  },
  {
    path: 'account/wizard',
    loadComponent: () =>
      import('./pages/account/wizard/wizard.component').then(
        (m) => m.AccountWizardPageComponent,
      ),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'account/details',
    loadComponent: () =>
      import('./pages/account/details/details.component').then(
        (m) => m.AccountDetailsPageComponent,
      ),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutPageComponent),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/error/error.component').then((m) => m.ErrorPageComponent),
    data: {
      errorType: 'NotFound',
    },
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
