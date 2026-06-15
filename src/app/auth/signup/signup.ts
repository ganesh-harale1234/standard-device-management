import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../services/user';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [SharedModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
signupForm:FormGroup;
showpassword:boolean = true;

constructor(private fb:FormBuilder, private userService:User, private router:Router){
 this.signupForm = this.fb.group({
  username: ['', Validators.required],
  password: ['', Validators.required]
 })
}

login(){
  if(this.signupForm.valid){
  const loginData ={
    ...this.signupForm.value
  } 
  this.userService.userLogin(loginData).subscribe((res:any)=>{
    alert('Login Sucessfully....!')
  })
  }else{
    this.signupForm.markAllAsTouched()
  }
}



gotoLogin(){
this.router.navigate(['/login'])
}

}
