import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { delay, filter, Observable, tap } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { User } from '../../services/user';
import { DataService } from '../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';


@UntilDestroy()
@Component({
  selector: 'app-header',
  imports: [SharedModule, CommonModule, RouterModule, NgxSpinnerModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

export class Header {
  isLoading = false;
  selectedSection$!: Observable<any>;
  userName:any;
  roleName:any;
  changePasswordForm!: FormGroup;
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  count:any;
  subCount:any;
  constructor(private observer: BreakpointObserver,   private fb: FormBuilder,
  private toaster: ToastrService, private router: Router, private userService:User, private dataService:DataService) {
 
 
  this.changePasswordForm = this.fb.group({

    oldPassword: ['', Validators.required],

    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]]

  });
  }

  ngOnInit(): void {
this.roleName =  sessionStorage.getItem('roll');
this.userName =  sessionStorage.getItem('userName');

  }

  ngAfterViewInit() {
    console.log('in after view init');
    this.observer
      .observe(['(max-width: 800px)'])
      .pipe(delay(1), untilDestroyed(this))
      .subscribe((res: any) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.sidenav.mode === 'over') {
          this.sidenav.close();
        }
      });
  }
  onSignOut() {
  this.userService.logout()
  }



showChangePasswordModal = false;

openPasswordModal() {
  this.showChangePasswordModal = true;
}

closeModal() {
  this.showChangePasswordModal = false;
}



updatePassword(): void {

  if (this.changePasswordForm.invalid) {

    this.changePasswordForm.markAllAsTouched();
    return;

  }

  const payload =  {
    ...this.changePasswordForm.value,
    userName:this.userName
  } 

  this.dataService.addData('changePassword', payload).subscribe({

    next: (res: any) => {

      this.toaster.success(res.message || 'Password updated successfully');

      this.changePasswordForm.reset();

      this.closeModal();

    },

    error: (err: any) => {

      this.toaster.error(
        err?.error?.message || 'Failed to update password.'
      );

    }

  });

}

// get f() {
//   return this.changePasswordForm.controls;
// }
showpassword:boolean = false;
showpasswordNeW:boolean = false;

 showPassword() {
    this.showpassword = !this.showpassword;
  }
 showPasswordNew() {
    this.showpassword = !this.showpassword;
  }

}
