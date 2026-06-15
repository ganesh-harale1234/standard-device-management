import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data-service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-add-category',
  imports: [SharedModule, CommonModule],
  templateUrl: './add-category.html',
  styleUrl: './add-category.scss',
})
export class AddCategory {

  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;
  categoryId:any;
  // table columns
  displayedColumns: string[] = [
    'Srno',
    'categoryName',
    'action'
  ];

  // dummy data;
  getAllList:any = [];

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
  constructor(private fb: FormBuilder, private toaster:ToastrService, private dataService:DataService) {
    this.form = this.fb.group({
      categoryName: ['', [Validators.required,]],
    });
  }


  ngOnInit(): void {
 
    this.getallData();
  }

getallData() {
  this.dataService.getAllData('getAllCategory').subscribe((res: any) => {
    if (res.code === 100) {
      this.getAllList = res?.extend?.allCategory;

      this.dataSource = new MatTableDataSource(this.getAllList);
      this.dataSource.paginator = this.paginator;
    }
    else if (res.code === 500) {
      this.toaster.error('Internal server error!');
    }
    else {
      this.toaster.error('Something went wrong!');
    }
  }, err => {
    const errorMsg = err.error.msg || 'Failed to load Category list!';
    this.toaster.error(errorMsg);
  });
}


onSubmit(){

if(this.form.valid){
 const formData = {
  ...this.form.value
 }
 this.dataService.addData('addCategory', formData).subscribe((res:any)=>{
  if(res.code === 100){
    this.toaster.success(res.msg || 'Category add sucessfully !')
    this.form.reset();
       this.filterallData = [...this.getAllList];
    this.totalItems = this.filterallData.length;
    this.pageIndex = 0;
    this.applyPagination();
    this.getallData();
    this.backtoList();
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
this.categoryId = id;
  this.showFormData = true;
    this.showTableData = false;
    this.isEditMode = true;
    if(id){
      this.dataService.getById('getCategoryById/'+id).subscribe((res:any)=>{
        if(res.code === 100 && res.extend && res.extend.deviceGroup){
        const categoryData = res.extend.deviceGroup;
    this.form.patchValue({
      categoryName : categoryData.categoryName
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
     categoryId:this.categoryId,
      ...this.form.value
    }
    this.dataService.updateData('updateCategory',fromData).subscribe((res:any)=>{
      if(res.code == 100){
        this.toaster.success(res.msg || 'Category Data Update Sucessfully !')
        this.getallData();
        this.form.reset();
        this.backtoList();
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
  this.categoryId = id;
this.dataService.deleteData('deleteCategoryById/'+this.categoryId).subscribe((res:any)=>{
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
      item.categoryName.toLowerCase().includes(value)
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
