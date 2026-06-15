import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from './login/login';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared-module';
import { MatButtonModule } from '@angular/material/button';

export const routes: Routes = [
  {
    path:'',
    component:Login
  }
]

@NgModule({
  declarations: [Login],
  imports: [
    CommonModule,
    SharedModule,
     MatButtonModule, 
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
