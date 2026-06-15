import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { delay, filter, Observable, tap } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user';
import { DataService } from '../../services/data-service';


@UntilDestroy()
@Component({
  selector: 'app-header',
  imports: [SharedModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

export class Header {
  isLoading = false;
  selectedSection$!: Observable<any>;
  userName:any;
  roleName:any;
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  count:any;
  subCount:any;
  constructor(private observer: BreakpointObserver, private router: Router, private userService:User, private dataService:DataService) {
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
}
