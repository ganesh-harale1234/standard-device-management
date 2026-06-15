import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../../shared/shared-module';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data-service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
export interface SmtpCredentialItem {
  emailId: string;
}

@Component({
  selector: 'app-smtp-email-id',
  imports: [CommonModule, SharedModule],
  templateUrl: './smtp-email-id.html',
  styleUrl: './smtp-email-id.scss',
})
export class SmtpEmailId {

  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;
  filterallData:any;
  locationId:any;
  // table columns
  displayedColumns: string[] = [
    'Srno',
    'emailId',
    'action'
  ];

  getAllList:any = [];
    dataSource = new MatTableDataSource([]);

  // pagination + table
  fullData: SmtpCredentialItem[] = [];
  pageIndex = 0;
  pageSize = 10;
  pageStart = 0;
  pageEnd = 0;
  totalItems = 0;

  form!: FormGroup;
  @ViewChild(MatPaginator) paginator! : MatPaginator;
  constructor(private fb: FormBuilder, private toaster:ToastrService, private dataService:DataService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.getallData();
  }

  getallData(){
    this.dataService.getAllData('getAllSmtpEmail').subscribe((res:any)=>{
      if(res.code === 100){
    
      this.getAllList = res.extend.SmtpEmail;
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
      const errorMsg = err.error.msg || 'Faild to load SMTP Email list !'
      this.toaster.error(errorMsg)
    })
  )
  }

onSubmit(){

if(this.form.valid){
 const formData = {
  ...this.form.value
 }
 this.dataService.addData('addSmtpEmail', formData).subscribe((res:any)=>{
  if(res.code === 100){
    this.toaster.success(res.msg || 'SMTP Email add sucessfully !')
    this.form.reset();
       this.filterallData = [...this.getAllList];
    this.totalItems = this.filterallData.length;
    this.pageIndex = 0;
    this.applyPagination();
    this.getallData();
    this.backtoList()
  }
  else if(res.code === 200){
this.toaster.error('This email has already been added.');
  }
  else if(res.code === 500){
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
      this.dataService.getById('getSmtpEmailById/'+id).subscribe((res:any)=>{
        if(res.code === 100){

        const categoryData = res.extend.SmtpEmailId;
    this.form.patchValue({
      email : categoryData.email
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
    this.dataService.updateData('updateSmtpEmail',fromData).subscribe((res:any)=>{
      if(res.code === 200){
        this.toaster.success(res.msg || 'SMTP Email Data Update Sucessfully !')
        this.getallData();
        this.form.reset();
        this.backtoList()
        this.isEditMode = false;

      }else if(res.code === 100) {

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
this.dataService.deleteData('deleteSmtpEmailById/'+this.locationId).subscribe((res:any)=>{
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
      item.email.toLowerCase().includes(value) 

    );

    this.filterallData = filtered;
    this.totalItems = this.filterallData.length;
    this.pageIndex = 0;
    this.applyPagination();
  }


  // show form
  addnew(): void {
    this.showFormData = true;
    this.showTableData = false;
    this.form.reset();
    this.isEditMode = false
  }

  // back to table
  backtoList(): void {
    this.showFormData = false;
    this.showTableData = true;
     this.isEditMode = false

  }


  onCancel(): void {
    this.form.reset();
    this.backtoList();
    this.isEditMode = false

  }

     onPageChange(event: PageEvent) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}
}
