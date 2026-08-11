import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data-service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-working-hours',
  imports: [SharedModule,CommonModule],
  templateUrl: './working-hours.html',
  styleUrl: './working-hours.scss',
})
export class WorkingHours {

  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;
groupId:any;
  // table columns
  displayedColumns: string[] = [
    'Srno',
    'inTime',
     'outTime',
     'branch-name',
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
      inTime: ['', [Validators.required,]],
      outTime: ['', [Validators.required,]],
      locationId:['', Validators.required]
    });
  }
 
formatTime(time: string): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':');

  const h = Number(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';

  const hour12 = h % 12 || 12;

  return `${hour12}:${minutes} ${ampm}`;
}

  ngOnInit(): void {
    // this.applyPagination();
    this.getallData();
    this.getallDataLocation()
  }

  getAllListLocation:any [] = [];

 getallDataLocation(){
    this.dataService.getAllData('findAllLocation').subscribe((res:any)=>{

      if(res.code === 100){
      this.getAllListLocation = res.extend.data;

      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        // this.toaster.error('Something went wrong !')
      }
    }, ((err)=>{
      const errorMsg = err.error.msg || 'Faild to load Location list !'
      this.toaster.error(errorMsg)
    })
  )
  }
 
  getallData(){
    this.dataService.getAllData('workingHours/getAllWorkingHours').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllList = res.extend.data;
          this.filterallData = this.getAllList;
                   this.dataSource = new MatTableDataSource(this.getAllList);
      this.dataSource.paginator = this.paginator;
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        // this.toaster.error('Something went wrong !')
      }
    }, ((err)=>{
      const errorMsg = err.error.msg || 'Faild to load Group list !'
      this.toaster.error(errorMsg)
    })
  )
  }

onSubmit(){

if(this.form.valid){

 const payload = {
  inTime: `${this.form.value.inTime}:00`,
  outTime: `${this.form.value.outTime}:00`,
  locationId: this.form.value.locationId
};
  
 this.dataService.addDataC('workingHours/saveWorkingHours', payload).subscribe((res:any)=>{
  if(res.code === 100){
    this.toaster.success(res.msg || 'Working Hours Created Successfully!')
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
    // this.toaster.error('Something went wrong !')
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
this.groupId = id;
  this.showFormData = true;
    this.showTableData = false;
    this.isEditMode = true;
    if(id){

      this.dataService.getByIdC('workingHours/getWorkingHours/'+id).subscribe((res:any)=>{
        if(res.code === 100 && res.extend && res.extend.data){
        const categoryData = res.extend.data;
   
    this.form.patchValue({
  
            inTime: categoryData.inTime,
              outTime: categoryData.outTime,
                locationId: categoryData.locationId,
    })
        }else{
      this.toaster.error('No Data fond api !')
    }
      },((err:any)=>{
          if(err?.error?.msg){
            const errMsg = err?.error?.msg || 'Server side error !'
            this.toaster.error(errMsg)
          }else{
            // this.toaster.error('Something went wrong !')
          }
      })
    )
    
    }
  
}

onUpdate(){
  if(this.form.valid){
 

 const formatTime = (time: string) =>
  time.length === 5 ? `${time}:00` : time;

const payload = {
  id: this.groupId,
  inTime: formatTime(this.form.value.inTime),
  outTime: formatTime(this.form.value.outTime),
  locationId: this.form.value.locationId
};

    this.dataService.updateDataC('workingHours/updateWorkingHours',payload).subscribe((res:any)=>{
      if(res.code === 100){
        this.toaster.success(res.msg || 'Working hours Data Update Sucessfully !')
        this.getallData();
        this.backtoList()
        this.form.reset();
        this.isEditMode = false;

      }else if(res.code === 200) {

        this.toaster.error(res.msg)
      }else{
        // this.toaster.error('Something went wrong !')
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
  this.groupId = id;
this.dataService.deleteDataC('workingHours/deleteWorkingHours/'+this.groupId).subscribe((res:any)=>{
  if(res.code === 100){
 this.toaster.success(res.msg || 'Data deleted successfully !')
  this.getallData();

  }else if(res.code === 500){
    this.toaster.error('Internal Server Error !')
  }else{
    // this.toaster.error('Something went wrong !')
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
      item.locationName.toLowerCase().includes(value)
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
