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
deviceId:any
displayedColumns: string[] = [
  'sr-No',
  'id',
  'serialNum',
    'ipAddress',
  'deviceName',
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
      authorizedDevice:['',Validators.required]

    }))
   }

  ngOnInit(): void {
    this.getDeviceallList();
    this.locationListall();
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

   getDeviceallList(){
    this.dataService.getAllData('device').subscribe((res:any)=>{
      this.dataSource = res;
       this.dataSource.paginator = this.paginator;
    })
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
      locationId:deviceData.locationId
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


onUpdate(){
 if(this.form.valid){
  const formData = {
   id:this.deviceId,
   ...this.form.value
  }
  this.dataService.updateData('updateDevice', formData).subscribe((res:any)=>{

if(res.code ===100){
  this.toaster.success('Device Data Updated Successfully !')
  this.form.reset();
  this.backtoList();
  this.getDeviceallList();
  this.backtoList()
}else{
  this.toaster.error('Something went wrong !')
}
  
  })
 }else{
  this.form.markAllAsTouched();
  this.toaster.error('Please fill all fields required !')
 }

}

}
