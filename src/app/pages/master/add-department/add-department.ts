import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-add-department',
  imports: [SharedModule, CommonModule],
  templateUrl: './add-department.html',
  styleUrl: './add-department.scss',
})
export class AddDepartment {
  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;
deptId:any;
  // table columns
  displayedColumns: string[] = [
    'Srno',
    'department-name',
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
      deptName: ['', [Validators.required,]],
      deptDesc:['', Validators.required]
    });
  }

  ngOnInit(): void {
    // this.filterallData = [...this.getAllList];
    // this.totalItems = this.filterallData.length;
    // this.applyPagination();
    this.getallData();
  }


  getallData(){
    this.dataService.getAllData('getAllDepartments').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllList = res.extend.allDepartments;
            this.filterallData = this.getAllList;
              // this.totalItems = this.filterallData.length;
              // this.applyPagination();
               this.dataSource = new MatTableDataSource(this.getAllList);
      this.dataSource.paginator = this.paginator;
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, ((err)=>{
      const errorMsg = err.error.msg || 'Faild to load Department list !'
      this.toaster.error(errorMsg)
    })
  )
  }

onSubmit(){

if(this.form.valid){
 const formData = {
  ...this.form.value
 }
 this.dataService.addData('addDepartment', formData).subscribe((res:any)=>{
  if(res.code === 100){
    this.toaster.success(res.msg  || 'Department add sucessfully !')
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
this.deptId = id;
  this.showFormData = true;
    this.showTableData = false;
    this.isEditMode = true;

    if(id){
      this.dataService.getById('getDepartmentById/'+id).subscribe((res:any)=>{
        if(res.code === 100){
        const categoryData = res.extend.deviceGroup;
    this.form.patchValue({
      deptName : categoryData.deptName,
       deptDesc:categoryData.deptDesc
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
     deptId:this.deptId,
        deptName:this.form.value.deptName,
        deptDesc:this.form.value.deptDesc

    }
    this.dataService.updateData('updateDepartment',fromData).subscribe((res:any)=>{
      if(res.code == 200){
        this.toaster.success(res.msg || 'Department Data Update Sucessfully !')
        this.getallData();
        this.form.reset();
        this.backtoList()
        this.isEditMode = false;

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
  this.deptId = id;
this.dataService.deleteData('deleteDepartmentById/'+this.deptId).subscribe((res:any)=>{
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
      item.deptName.toLowerCase().includes(value)
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
