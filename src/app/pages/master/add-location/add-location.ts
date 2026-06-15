import { Component, EventEmitter, Input, Output, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data-service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PersonTracking } from "../../person-tracking/person-tracking";

@Component({
  selector: 'app-add-location',
  imports: [SharedModule, CommonModule],
  templateUrl: './add-location.html',
  styleUrl: './add-location.scss',
})
export class AddLocation {
@Input() userInfo :any;
@Output() childData = new EventEmitter<string>()
  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;
  locationId:any
  // table columns
  displayedColumns: string[] = [
    'Srno',
    'Location-name',
    'action'
  ];

  // dummy data
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
      locationName: ['', [Validators.required,]],
    });
  }

  ngOnInit(): void {
   
    this.getallData()
  }

  sendData(){
    this.childData.emit("THIS IS A Child data.....")
  }

 getallData(){
    this.dataService.getAllData('findAllLocation').subscribe((res:any)=>{

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
    }, ((err)=>{
      const errorMsg = err.error.msg || 'Faild to load Location list !'
      this.toaster.error(errorMsg)
    })
  )
  }

onSubmit(){

if(this.form.valid){
 const formData = {
  ...this.form.value
 }
 this.dataService.addData('addLocation', formData).subscribe((res:any)=>{
  if(res.code === 100){
    this.toaster.success(res.msg || 'Location add sucessfully !')
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
      this.dataService.getById('findLocationById/'+id).subscribe((res:any)=>{
        if(res.code === 100){
        const categoryData = res.extend.data;
    this.form.patchValue({
      locationName : categoryData.locationName
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
     locationId:this.locationId,
      ...this.form.value
    }
    this.dataService.updateData('updateLocation',fromData).subscribe((res:any)=>{
      if(res.code === 100){
        this.toaster.success(res.msg || 'Location Data Update Sucessfully !')
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

  this.locationId = id;
this.dataService.deleteData('deleteLocationById/'+this.locationId).subscribe((res:any)=>{
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
      item.locationName?.toLowerCase().includes(value)
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
