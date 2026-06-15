import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinner, NgxSpinnerModule } from 'ngx-spinner';
import { DataService } from '../../services/data-service';
import { StatustextPipe } from '../../shared/statustext-pipe';
export interface Device {
  id: number;
  serialNum: string;
  area: string;                 // matches your 'area' field
  deviceName: string;
  ipAddress: string;
  IoStatus: 'Online' | 'Offline';
  status: 'Active' | 'Inactive';
  lastActivity: string;         // you can change to Date if you parse it
  userCount: number;
  fingerPrintCount: number;
  faceCount: number;
  transactionCount: number;
  offlineSince: string | null;  // null when online / not applicable
  location?: string;
}


const DEVICE_DATA: any = [
 
];
@Component({
  selector: 'app-dashboard',
  imports: [SharedModule, CommonModule, NgxSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})


export class Dashboard {
  

  displayedColumns: string[] = [ 'srNo', 'id', 'serialNum', 'area', 'deviceName', 'ipAddress', 'IoStatus', 'status', 'lastActivity', 'userCount', 'fingerPrintCount', 'faceCount', 'transectionCount', 'offlineSince'];

  dataSource: any = new MatTableDataSource(DEVICE_DATA);
  dashbordCount:any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private dataService: DataService, private toaster: ToastrService) { }

  ngOnInit(): void {
      this.dataService.setTitle('Analytics Dashboard');

    this.getAllDeviceList();
    this.getDashbordcount()
  }

  getAllDeviceList() {
    this.dataService.getAllData('getAllDeviceInfo').subscribe((res: any) => {
         const list = res;
     this.dataSource.data = list;          
      this.dataSource.paginator = this.paginator; 
    })
  }


 getDashbordcount(){
  this.dataService.getAllData(`dashboardTotalSummary`).subscribe((res:any)=>{
   this.dashbordCount = res;
  })
 }


}
