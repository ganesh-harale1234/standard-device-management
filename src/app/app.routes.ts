import { Routes } from '@angular/router';
import { GetDetails } from './pages/get-details/get-details';

export const routes: Routes = [



    { path: '', redirectTo: 'login', pathMatch: 'full' },


    {
    path: 'login',
    loadChildren: () =>
      import('./auth/auth-module').then((m) => m.AuthModule),
  },
 {
    path: '',
    loadChildren: () =>
      import('./layout/layout-module').then(m => m.LayoutModule)
  },

  {
    path:'signUp',
    loadComponent:()=> import('./auth/signup/signup').then((m)=> m.Signup)
  },

  // optional: wildcard route
  // { path: '**', redirectTo: 'dashboard' }

  {path:'details', component:GetDetails}

];
