import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../services/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../services/data-service';

@Component({
  selector: 'app-login',
  // imports: [],
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit{
  loginForm: FormGroup;
  showpassword: boolean = true;

  constructor(private fb: FormBuilder, private userService: User, private dataService:DataService, private router: Router, private toaster: ToastrService) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
   
    })
  }


locationID:any;
RoleName:any;
  ngOnInit(): void {
  // this.locationID = sessionStorage.getItem('locationId');
  // this.RoleName =  sessionStorage.getItem('roleName');
  
}

//   login() {
//     if (this.loginForm.valid) {
//       const loginData = {
//         ...this.loginForm.value
//       }
//       this.userService.userLogin(loginData).subscribe((res: any) => {
//         if (res.code === 100) {
//           console.log('Login response:', res);
//           this.toaster.success(res.msgs || 'Login successfully !');
//           this.router.navigate(['/dashboard'])
//           sessionStorage.setItem('locationId', res.extend.data.locationId),
//             sessionStorage.setItem('userName', res.extend.data.name),
//             sessionStorage.setItem('roll', res.extend.data.roll),
//             sessionStorage.setItem('roleName', res.extend.data.roleName)
//                   sessionStorage.setItem('locationName', res.extend.data.locationName),
//             sessionStorage.setItem('locationId', res.extend.data.locationId)
        
//         }else if(res.code === 200){
//           this.toaster.error(res.msg)
//         }
//       }, (error: any) => {
//   this.toaster.error("Server not reachable. Please try again.");
// } )
//     } else {
//       this.loginForm.markAllAsTouched()
//       this.toaster.error('Please fill all required fields!')
//     }
//   }



login() {
  if (this.loginForm.valid) {

    const loginData = {
      ...this.loginForm.value
    };

    this.userService.userLogin(loginData).subscribe(
      (res: any) => {

        if (res.code === 100) {

          console.log('Login response:', res);
            if (res.extend?.data?.roleName === 'User') {
    this.toaster.error('Access Denied for User Role...');
    return;
  }

          this.toaster.success(res.msgs || 'Login successfully!');

          // First save user/session data
          sessionStorage.setItem(
            'locationId',
            res.extend.data.locationId
          );

          sessionStorage.setItem(
            'userName',
            res.extend.data.name
          );

          sessionStorage.setItem(
            'roll',
            res.extend.data.roll
          );

          sessionStorage.setItem(
            'roleName',
            res.extend.data.roleName
          );

          sessionStorage.setItem(
            'locationName',
            res.extend.data.locationName
          );


           this.locationID =  res.extend.data.locationId
        this.RoleName =   res.extend.data.roleName
          // DON'T navigate dashboard here
          // First check new devices
if(this.RoleName === 'Admin'){
          this.checkNewDevices();

}else {
       this.goToDashboard();
}


        } else if (res.code === 200) {

          this.toaster.error(res.msg);

        }

      },
      (error: any) => {

        this.toaster.error(
          'Server not reachable. Please try again.'
        );

      }
    );

  } else {

    this.loginForm.markAllAsTouched();

    this.toaster.error(
      'Please fill all required fields!'
    );
  }
}
showNewDeviceModal = false;
newDeviceCount = 0;

checkNewDevices(): void {

  let apiUrl = '';

  // Branch Admin → only branch/location devices
  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `device?locationId=${this.locationID}`;
  } else {
    apiUrl = 'device';
  }

  this.dataService.getAllData(apiUrl).subscribe({
    next: (res: any[]) => {

      console.log('Device List Response:', res);

      // API response is directly an array
      const devices = res || [];

      // Find devices where Access Group is not assigned
      const newDevices = devices.filter(
        (device: any) =>
          device.accessGroupId === null
      );

      console.log('New Devices:', newDevices);

      if (newDevices.length > 0) {

        // New devices found
        this.newDeviceCount = newDevices.length;

        // Open modal
        this.showNewDeviceModal = true;

      } else {

        // No new devices
        this.goToDashboard();
      }
    },

    error: (error: any) => {

      console.error(
        'Device list API error:',
        error
      );

      // If API fails, allow user to continue to Dashboard
      this.goToDashboard();
    }
  });
}

goToDashboard(): void {
  this.router.navigate(['/dashboard']);
}


closeNewDeviceModal(): void {

  this.showNewDeviceModal = false;

  this.goToDashboard();
}
  showPassword() {
    this.showpassword = !this.showpassword;
  }


  goToDeviceList(): void {

  this.showNewDeviceModal = false;

  this.router.navigate(['/device-management']);
}
  gotoSignUp() {
    this.router.navigate(['/signUp'])
  }
  


}
