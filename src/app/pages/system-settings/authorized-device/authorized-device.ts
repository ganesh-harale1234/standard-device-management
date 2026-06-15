import { Component, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Device } from '../../dashboard/dashboard';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data-service';
import { MatLine } from "@angular/material/core";
const DEVICE_DATA: Device[] = [
  {
    id: 2,
    serialNum: 'SN-1002',
    area: 'Back Office',
    deviceName: 'Attendance Device 2',
    ipAddress: '192.168.0.11',
    IoStatus: 'Offline',
    status: 'Active',
    lastActivity: '2025-11-17 08:10:05',
    userCount: 95,
    fingerPrintCount: 280,
    faceCount: 60,
    transactionCount: 1120,
    offlineSince: '2025-11-17 09:00:00'
  },
 

    {
    id: 2,
    serialNum: 'SN-1002',
    area: 'Back Office',
    deviceName: 'Attendance Device 2',
    ipAddress: '192.168.0.11',
    IoStatus: 'Offline',
    status: 'Active',
    lastActivity: '2025-11-17 08:10:05',
    userCount: 95,
    fingerPrintCount: 280,
    faceCount: 60,
    transactionCount: 1120,
    offlineSince: '2025-11-17 09:00:00'
  },
];
@Component({
  selector: 'app-authorized-device',
  imports: [SharedModule, CommonModule],
  templateUrl: './authorized-device.html',
  styleUrl: './authorized-device.scss',
})
export class AuthorizedDevice {
  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;

  // table columns
  displayedColumns: string[] = [
   
    'Srno',
    'device-serial-no',
    'action'
  ];

  // dummy data
  getAllList:any = [
    {
      emailId: '3243245234'
    },
  {
      emailId: '7568765765'
    },
 
  ];
   
    locationId:any
   
  
    // getAllList:any = [];
  
    // pagination + table
    filterallData: any = [];
    dataSource = new MatTableDataSource([]);
  
    pageIndex = 0;
    pageSize = 10 ;
    pageStart = 0;
    pageEnd = 0;
    totalItems = 0;
  
  form!: FormGroup;
   @ViewChild(MatPaginator) paginator!: MatPaginator;
    constructor(private fb: FormBuilder, private toaster:ToastrService, private dataService:DataService) {
      this.form = this.fb.group({
        deviceSerialNumber: ['', [Validators.required,]],
      });
    }
  
    ngOnInit(): void {
     
      this.getallData()
    }

    
   getallData(){
      this.dataService.getAllData('findAllSerialNumber').subscribe((res:any)=>{
  
        if(res.code === 100){
        this.getAllList = res.extend.data;
            this.filterallData = this.getAllList;
                   this.dataSource = new MatTableDataSource(this.getAllList);
      this.dataSource.paginator = this.paginator;
        }else if(res.code===500){
                  this.toaster.error('Internal server error !')
        }
        else{
          this.toaster.error('Something went wrong !')
        }
      }, ((err:any)=>{
        const errorMsg = err.error.msg || 'Faild to load Serial_Number list !'
        this.toaster.error(errorMsg)
      })
    )
    }
  
  onSubmit(){
  
  if(this.form.valid){
   const formData = {
    ...this.form.value
   }
   this.dataService.addData('addDeviceSerialNumber', formData).subscribe((res:any)=>{
    if(res.code === 100){
      this.toaster.success(res.msg || 'Serial Number add sucessfully !')
      this.form.reset();
         this.filterallData = [...this.getAllList];
      this.totalItems = this.filterallData.length;
      this.pageIndex = 0;
      this.applyPagination();
      this.getallData();
      this.backtoList()
    }else if(res.code === 500){
      this.toaster.error('Internal server error !')
    }else{
      this.toaster.error('Something went wrong !')
    }
   }, ((err:any)=>{
    const errorMsg = err?.error?.msg || 'Server side error !'
    this.toaster.error(errorMsg)
  
   }))
  
  }else{
    this.form.markAllAsTouched();
    this.toaster.error('Please fill all required fields!')
  }
  
   
  
  }
  
  editData(id:any){
  this.locationId = id;
    this.showFormData = true;
      this.showTableData = false;
      this.isEditMode = true;
      if(id){
        this.dataService.getById('getDeviceSerialNumberById/'+id).subscribe((res:any)=>{
          if(res.code === 100){
          const serialnumberData = res.extend.data;
      this.form.patchValue({
        deviceSerialNumber : serialnumberData.deviceSerialNumber
      })
          }else{
        this.toaster.error('No Data fond api !')
      }
        },((err:any)=>{
            if(err?.error?.msg){
              const errMsg = err?.error?.msg || 'Server side error !'
              this.toaster.error(errMsg)
            }else{
              this.toaster.error('Something went wrong !')
            }
        })
      )
      
      }
    
  }
  
  onUpdate(){
    if(this.form.valid){
      const fromData = {
       id:this.locationId,
        ...this.form.value
      }
      this.dataService.updateData('updateSerialNumber',fromData).subscribe((res:any)=>{
        if(res.code === 100){
          this.toaster.success(res.msg || 'Serial Number Update Sucessfully !')
          this.getallData();
          this.form.reset();
          this.backtoList()
          this.isEditMode = false;
  
        }else if(res.code === 200) {
  
          this.toaster.error(res.msg)
        }else{
          this.toaster.error('Something went wrong !')
        }
      },((err:any)=>{
        if(err?.error?.msg){
              this.toaster.error( err.error.msg,'error!')
        }else{
                      this.toaster.error('Server side error !')
        }
      })
    )
    }else{
      this.form.markAllAsTouched();
      this.toaster.error('Please fill all required fields!')
    }
  }
  
  delete(id:any){
    
  // if(!confirm('Are you sure delete in this Record') ){
  //   return 
  // }

  this.dataService.deleteData('deleteSerialNumberById/'+id).subscribe((res:any)=>{
    if(res.code === 100){
   this.toaster.success(res.msg || 'Data deleted successfully !')
    this.getallData();
  
    }else if(res.code === 500){
      this.toaster.error('Internal Server Error !')
    }else{
      this.toaster.error('Something went wrong !')
    }
  
  },((err:any)=>{
           const errorMessage = err?.error?.message || 'Something went wrong!';
           this.toaster.error(errorMessage)
  })
  
  )
  }
  
  
  
    // show form
    addnew(): void {
      this.showFormData = true;
      this.showTableData = false;
      this.form.reset();
      this.isEditMode = false;
   
    }
  
    // back to table
    backtoList(): void {
      this.showFormData = false;
      this.showTableData = true;
       this.isEditMode = false;
  
    }
  
    // pagination code 
    applyPagination(): void {
      const start = this.pageIndex * this.pageSize;
      const end = start + this.pageSize;
  
      this.dataSource.data = this.filterallData.slice(start, end);
  
      this.pageStart = this.totalItems ? start + 1 : 0;
      this.pageEnd = Math.min(end, this.totalItems);
    }
  
    nextPage(): void {
      if ((this.pageIndex + 1) * this.pageSize < this.totalItems) {
        this.pageIndex++;
        this.applyPagination();
      }
    }
  
    previousPage(): void {
      if (this.pageIndex > 0) {
        this.pageIndex--;
        this.applyPagination();
      }
    }
  
    // search  Filter code here
    applyFilter(event: any): void {
      const value = (event.target.value || '').trim().toLowerCase();
  
      const filtered = this.getAllList.filter((item:any) =>
        item.deviceSerialNumber.toLowerCase().includes(value)
      );
  
      this.filterallData = filtered;
      this.totalItems = this.filterallData.length;
      this.pageIndex = 0;
      this.applyPagination();
    }
  
  
    onCancel(): void {
      this.form.reset();
      this.isEditMode = false;
    }
     onPageChange(event: PageEvent) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}



}
