import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../shared/shared-module';
import { Device } from '../../dashboard/dashboard';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data-service';

@Component({
  selector: 'app-device-management',
  imports: [SharedModule, CommonModule],
  templateUrl: './device-management.html',
  styleUrl: './device-management.scss',
})
export class DeviceManagement {
showFormData:boolean = false;
showTableData:boolean = true;
isEditMode:boolean = false;
form:FormGroup;
deviceName:any;
ioStatus:any;
locationId:any;
locationList:any = [];
getAllListLocation:any;
deviceId:any;
getAllListgroup:any;

searchType: string = 'deviceName';
searchText: string = '';
selectedValue: string = '';
allDeviceList: any[] = [];
dropdownList: string[] = [];
displayedColumns: string[] = [
  'sr-No',
  'id',
  'serialNum',
    'ipAddress',
  'deviceName',
  'location',
  'IoStatus',
  'status',
 'edit',
];

  pageIndex = 0;
  pageSize = 10;
  pageStart = 0;
  pageEnd = 0;
  totalItems = 0;
  dataSource:any = new MatTableDataSource
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb:FormBuilder, private toaster:ToastrService, private dataService:DataService) {
    this.form = this.fb.group(({
     
      deviceName:['', Validators.required],
      ioStatus:['', Validators.required],
      locationId:['', Validators.required],
      // authorizedDevice:['',Validators.required],
  accessGroupId: [null, Validators.required]


    }))
   }

locationID:any;
RoleName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');
    this.getDeviceallList();
    this.locationListall();
    this.getallDatagroup();
  }

    getallDatagroup(){
    this.dataService.getAllData('accessGroup/getAllAccessGroups').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllListgroup = res.extend.data;
  
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, 
  )
  }

   locationListall(){
    this.dataService.getAllData('findAllLocation').subscribe((res:any)=>{

      if(res.code === 100){
      this.getAllListLocation = res.extend.data;

      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, ((err)=>{
      const errorMsg = err.error.msg || 'Faild to load Location list !'
      this.toaster.error(errorMsg)
    })
  )
  }

getDeviceallList() {

   let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `device?locationId=${this.locationID}`;
  } else {
    apiUrl = 'device';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any[]) => {

    this.allDeviceList = res;      // Original Data

    this.dataSource = new MatTableDataSource(res);

    this.dataSource.paginator = this.paginator;

    this.totalItems = res.length;

  });

}
  
    editData(id:any): void {
 this.deviceId = id;
      this.showFormData = true;
      this.showTableData = false;

      this.dataService.getById('getDeviceById?id='+id).subscribe((res:any)=>{
     if(res.code==100){
       const deviceData =  res.extend.singleDevice;
       this.form.patchValue({
        deviceName:deviceData.deviceName,
      ioStatus:deviceData.ioStatus,
      locationId:deviceData.locationId,
     accessGroupId: Number(deviceData.accessGroupId),
      //  authorizedDevice:deviceData.authorizedDevice
 
       })
     }
      })


    }

    backtoList(){
    this.showFormData = false
  this.showTableData = true
}
onCancel(){
    this.backtoList();
    this.form.reset()
}

accessGroupError = false;
onUpdate() {

  this.form.markAllAsTouched();

  if (this.form.invalid) {
    this.toaster.error('Access Group is required!');
    return;
  }

  const formData = {
    id: this.deviceId,
    ...this.form.value
  };

  this.dataService.updateData('updateDevice', formData).subscribe((res: any) => {

    if (res.code === 100) {
      this.toaster.success('Device Data Updated Successfully!');
      this.form.reset();
      this.backtoList();
      this.getDeviceallList();
    } else {
      this.toaster.error('Something went wrong!');
    }

  });
}









onSearchTypeChange() {

  this.searchText = '';

  this.selectedValue = '';

  switch (this.searchType) {

    case 'status':
      this.dropdownList = ['Online', 'Offline'];
      break;

    case 'ioStatus':
      this.dropdownList = ['IN', 'OUT', 'IO'];
      break;

    default:
      this.dropdownList = [];
      break;

  }

  this.dataSource.data = [...this.allDeviceList];

}



applyFilter() {

  let data = [...this.allDeviceList];

  // Status
  if (this.searchType === 'status' && this.selectedValue) {

    data = data.filter((item: any) =>
      (item.status == 1 ? 'Online' : 'Offline') === this.selectedValue
    );

  }

  // IO Status
  else if (this.searchType === 'ioStatus' && this.selectedValue) {

    data = data.filter((item: any) =>
      item.ioStatus === this.selectedValue
    );

  }

  // Text Search
  else if (this.searchText.trim()) {

    const text = this.searchText.toLowerCase();

    data = data.filter((item: any) => {

      switch (this.searchType) {

        case 'deviceName':
          return item.deviceName?.toLowerCase().includes(text);

        case 'serialNum':
          return item.serialNum?.toLowerCase().includes(text);

        case 'ipAddress':
          return item.ipAddress?.toLowerCase().includes(text);


              case 'locationName':
          return item.locationName?.toLowerCase().includes(text);

        default:
          return true;

      }

    });

  }

  this.dataSource.data = data;

}

onSearchInput(event: any) {

  this.searchText = event.target.value;

  this.applyFilter();

}
getPlaceholder() {

  switch (this.searchType) {

    case 'deviceName':
      return 'Search Device Name';

    case 'serialNum':
      return 'Search Serial No';

    case 'ipAddress':
      return 'Search IP Address';

         case 'locationName':
      return 'Search branch Name';

    default:
      return 'Search';

  }

}

filterDropdown() {

  this.applyFilter();

}

}
