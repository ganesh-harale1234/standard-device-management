import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../services/user';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  imports: [SharedModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
signupForm:FormGroup;
showpassword:boolean = true;

constructor(private fb:FormBuilder, private dataService:DataService, private toaster:ToastrService, private router:Router){
 this.signupForm = this.fb.group({
  companyName: ['', Validators.required],
  branches: ['', Validators.required],
    ioType: ['', Validators.required]

 })
}

 

signup() {

  if (this.signupForm.invalid) {
    this.signupForm.markAllAsTouched();
    return;
  }

  const loginData = {
    ...this.signupForm.value,
    branches: Number(this.signupForm.value.branches)
  };

  this.dataService.addData('create', loginData).subscribe({

    next: (res: any) => {
      this.toaster.success(res.message || 'User created successfully');
      this.signupForm.reset();
    },

    error: (err: any) => {
      console.error('API Error:', err);

      if (err.status === 400) {
        this.toaster.error(err.error?.message || 'Invalid request.');
      } else if (err.status === 401) {
        this.toaster.error('Unauthorized.');
      } else if (err.status === 403) {
        this.toaster.error('Access denied.');
      } else if (err.status === 404) {
        this.toaster.error('API not found.');
      } else if (err.status === 409) {
        this.toaster.error(err.error?.message || 'Record already exists.');
      } else if (err.status === 500) {
        this.toaster.error('Internal server error.');
      } else if (err.status === 0) {
        this.toaster.error('Unable to connect to server.');
      } else {
        this.toaster.error(err.error?.message || 'Something went wrong.');
      }
    },

    complete: () => {
      console.log('API request completed');
    }

  });

}



gotoLogin(){
this.router.navigate(['/login'])
}

}
