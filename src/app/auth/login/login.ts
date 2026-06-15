import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../services/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  // imports: [],
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  showpassword: boolean = true;

  constructor(private fb: FormBuilder, private userService: User, private router: Router, private toaster: ToastrService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  login() {
    if (this.loginForm.valid) {
      const loginData = {
        ...this.loginForm.value
      }
      this.userService.userLogin(loginData).subscribe((res: any) => {
        if (res.code === 100) {

          this.toaster.success(res.msgs || 'Login successfully !');
          this.router.navigate(['/dashboard'])
          sessionStorage.setItem('locationId', res.extend.data.locationId),
            sessionStorage.setItem('userName', res.extend.data.name),
            sessionStorage.setItem('roll', res.extend.data.roll),
            sessionStorage.setItem('rollId', res.extend.data.rollId)
        }else if(res.code === 200){
          this.toaster.error(res.msg)
        }
      })
    } else {
      this.loginForm.markAllAsTouched()
      this.toaster.error('Please fill all required fields!')
    }
  }

  showPassword() {
    this.showpassword = !this.showpassword;
  }

  gotoSignUp() {
    this.router.navigate(['/signUp'])
  }


}
