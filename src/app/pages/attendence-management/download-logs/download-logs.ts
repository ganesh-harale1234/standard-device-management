import { Component, ViewChild } from '@angular/core';
import { Device } from '../../dashboard/dashboard';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-download-logs',
  imports: [SharedModule, CommonModule],
  templateUrl: './download-logs.html',
  styleUrl: './download-logs.scss',
})
export class DownloadLogs {
showFormData:boolean = false
showTableData:boolean = true
form:FormGroup
fromDate:Date = new Date;
toDate:Date = new Date;
roleid:any;
downloadDeviceList:any;
  companyList:any = [];
  selectedCompanyId: number | null = null;
 displayedColumns: string[] = [
  'id',
  'empId',
  'recordTime',
  'ioStatus',
  'deviceName',
];

  dataSource:any = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private fb:FormBuilder, private toaster:ToastrService, private dataService:DataService) {
    this.form = this.fb.group(({

    }))
   }

  ngOnInit(): void {
    this.getallDataLocation()
    this.getDeviceallList()
    this.getAllcompanyList();
    this.roleid = sessionStorage.getItem('rollId')

  }

  
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }




  getAllcompanyList(){
    this.dataService.getAllData('getAllCompany').subscribe((res:any)=>{
      this.companyList = res.extend.allCompany;
    }, (err:any)=>{
      this.toaster.error(err.error.msg || "Something went wrong..!")
    })
  }


  companyId:any;

  onCompanyChange(company:any) {
    this.companyId = company
    console.log('Selected Company ID:', this.companyId); 

  }

    backtoList(){
    this.showFormData = false
  this.showTableData = true
}

formatDateToYMD(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();

  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// Devices list
devicesList: any[] = [];

selectedDeviceIds: string[] = [];

// API call
getDeviceallList() {
  this.dataService.getAllData('device').subscribe((res: any) => {
    this.devicesList = res;
  });
}

// ---- Select All flag (Devices) ----
get isAllDeviceSelected(): boolean {
  return (
    this.selectedDeviceIds.length === this.devicesList.length &&
    this.devicesList.length > 0
  );
}

// ---- Single device selected 
isDeviceSelected(id: string): boolean {
  return this.selectedDeviceIds.includes(id);
}

// ---- Single device toggle ----
toggleDevice(id: string, event: any): void {
  const checked = event.checked;

  if (checked) {
    if (!this.selectedDeviceIds.includes(id)) {
      this.selectedDeviceIds = [...this.selectedDeviceIds, id];
    }
  } else {
    this.selectedDeviceIds = this.selectedDeviceIds.filter(
      (devId) => devId !== id
    );
  }

  console.log('Selected Device IDs : ', this.selectedDeviceIds);
}

// ---- Select All toggle (Devices) ----
toggleSelectAllDevice(event: any): void {
  const checked = event.checked;

  if (checked) {
    // serialNum array 
    this.selectedDeviceIds = this.devicesList.map(
      (d: any) => d.serialNum
    );
  } else {
    this.selectedDeviceIds = [];
  }

  console.log('Selected Device IDs (SelectAll) : ', this.selectedDeviceIds);
}

// ---- Device Name by serialNum (id) ----
getDeviceName(id: string) {
  const dev = this.devicesList.find((d: any) => d.serialNum === id);
  return dev ? dev.deviceName : id;
}



// Location list
locationList: any[] = [];

selectedLocationIds: string[] = [];

getallDataLocation() {
  this.dataService.getAllData('findAllLocation').subscribe(
    (res: any) => {
      if (res.code === 100) {
        this.locationList = res.extend.data;
      } else if (res.code === 500) {
        this.toaster.error('Internal server error !');
      } else {
        this.toaster.error('Something went wrong !');
      }
    },
    (err) => {
      const errorMsg = err.error.msg || 'Failed to load Location list !';
      this.toaster.error(errorMsg);
    }
  );
}

// ---- Select All flag ----
get isAllSelected(): boolean {
  return (
    this.selectedLocationIds.length === this.locationList.length &&
    this.locationList.length > 0
  );
}

isSelected(id: string): boolean {
  return this.selectedLocationIds.includes(id);
}

toggleLocation(id: string, event: any): void {
  const checked = event.checked;

  if (checked) {
    if (!this.selectedLocationIds.includes(id)) {
      this.selectedLocationIds = [...this.selectedLocationIds, id];
    }
  } else {
    this.selectedLocationIds = this.selectedLocationIds.filter(
      (locId) => locId !== id
    );
  }

  console.log('Selected Location IDs : ', this.selectedLocationIds);
}

// ---- Select All toggle ----
toggleSelectAll(event: any): void {
  const checked = event.checked;

  if (checked) {
    this.selectedLocationIds = this.locationList.map(
      (d: any) => d.locationId
    );
  } else {
    this.selectedLocationIds = [];
  }

  console.log('Selected Location IDs (SelectAll) : ', this.selectedLocationIds);
}

getLocationName(id: string) {
  const loc = this.locationList.find((d: any) => d.locationId === id);
  return loc ? loc.locationName : id;
}


downloadLog() {
  const from = this.formatDateToYMD(this.fromDate);
  const to = this.formatDateToYMD(this.toDate);
  const  startDate = from
   const endDate = to

   const data = {
    fromDate:from,
    toDate:to,
    companyNameList:this.companyId,
    deviceSerialNumList:this.selectedDeviceIds,
    locationId:this.selectedLocationIds
   }

  this.dataService.addData(`records`,data).subscribe(
   (resp) => {
        if(resp.code == 100){
             this.downloadDeviceList = resp.extend.records || [];
             this.dataSource.data = this.downloadDeviceList;
          this.toaster.success(resp.msgs || 'Data fond successfully... !')
        } else {
          this.toaster.error(resp.msg)
        }
      },
      (err) => {
        this.toaster.error(err.msg)
      }
    )
  
}



}
