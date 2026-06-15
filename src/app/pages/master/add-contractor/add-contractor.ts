import { Component, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-add-contractor',
  imports: [SharedModule, CommonModule],
  templateUrl: './add-contractor.html',
  styleUrl: './add-contractor.scss',
})
export class AddContractor {
  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;
  editConID:any;
  deleteConID:any;

  // table columns
  displayedColumns: string[] = [
    'Srno',
    'contractor-name',
    'action'
  ];

  // dummy data
  getAllList:any = [
    {
      emailId: 'admin@example.com'
    },
  {
      emailId: 'ganesh@example.com'
    },
 
  ];

  // pagination + table
  filterallData: any = [];
  dataSource = new MatTableDataSource([]);

  pageIndex = 0;
  pageSize = 10;
  pageStart = 0;
  pageEnd = 0;
  totalItems = 0;

form!: FormGroup;

 @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private dataService:DataService, private toaster:ToastrService) {
    this.form = this.fb.group({
      contractorName: ['', [Validators.required,]],
    });
  }

  ngOnInit(): void {
  
    this.getallData();
  }

  getallData(){
    this.dataService.getAllData('findAllcontractors').subscribe((res:any)=>{
      if(res.code === 100){
        this.getAllList = res.extend.allContractors;
          this.filterallData = [...this.getAllList];
      this.dataSource = new MatTableDataSource(this.getAllList);
      this.dataSource.paginator = this.paginator;
      }else{
        this.toaster.error('Data not found !')
      }
    }, ((err:any)=>{
      const errorMsg = err?.error?.msg  || 'Fail to load Contactor List';
      this.toaster.error(errorMsg)
    }) )
  }


onSubmit(){
if(this.form.valid){
  const formData = {
    ...this.form.value
  }
  this.dataService.addData('addContractor',formData).subscribe((res:any)=>{
    if(res.code === 100){
      this.toaster.success(res?.msg || 'Contractor added successfully!');
      this.getallData();
           this.filterallData = [...this.getAllList];
    this.totalItems = this.filterallData.length;
    this.pageIndex = 0;
    this.applyPagination();
    this.form.reset();
    this.backtoList()
    }else if(res.code === 500){
      this.toaster.error('Internal Server error !')
    }
    else{
      this.toaster.error('Something went wrong !')
    }
  }, ((err:any)=>{
     const errorMsg = err?.error?.msg || 'Server side error !'
     this.toaster.error(errorMsg)
  }) )
  
}else{
  this.form.markAllAsTouched();
  this.toaster.error('Please fill all fields required !')
}

 
}


editData(id:any){
  this.editConID = id;
  this.showFormData = true;
    this.showTableData = false;
    this.isEditMode = true;
this.dataService.getById('findContractorById?conId='+ id).subscribe((res:any)=>{
  if(res.code === 100){
    const contactorData = res.extend.contractor;
    this.form.patchValue({
      contractorName: contactorData.contractorName
    })
  }else{
    this.toaster.error('Something went wrong !')
  }
}, ((err:any)=>{
  const errorMsg = err?.error.msg  || 'Server side error !';
  this.toaster.error(errorMsg)
})

)  
    
}

onUpdate(){
 if(this.form.valid){
  const formData = {
    ...this.form.value,   
     conId:this.editConID,

  }
  this.dataService.updateData('updateContractor', formData).subscribe((res:any)=>{
    if(res.code === 100){
      this.toaster.success(res.msg || 'Contractor updated successfully !');
      this.getallData();
          this.form.reset();
          this.backtoList()
    }else if(res.code === 500){
      this.toaster.error('Internal server error !')
    }
    
    else{
      this.toaster.error('Server side error !')
    }
  }, ((err)=>{
    const errorMsg = err?.error?.msg || 'Server side error'
  }) )
 }else{
  this.form.markAllAsTouched();
  this.toaster.error('Please fill all fields required!')
 }
}

delete(id:any){
  const conId = id;
this.dataService.deleteData('deleteContractorById?conId='+conId).subscribe((res:any)=>{
 if(res.code === 100){
  this.toaster.success(res.msg || 'Contractor Deleted successfully !')
        this.getallData();
 }else if(res.code === 500) {
this.toaster.error('Internal server error !')
 }else{
  this.toaster.error('Something went wrong !')
 }
}, ((err:any)=>{
  const errMsg = err?.error?.msg  || 'Server side error !';
  this.toaster.error(errMsg)
}) )
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
      item.contractorName.toLowerCase().includes(value)
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
