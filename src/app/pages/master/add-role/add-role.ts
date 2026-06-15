import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data-service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared-module';
import { RolePermission } from '../../role-permission.model';


@Component({
  selector: 'app-add-role',
  imports: [CommonModule, SharedModule],
  templateUrl: './add-role.html',
  styleUrl: './add-role.scss',
})
export class AddRole {

  
  /* =======================
     ROLE DROPDOWN
  ======================== */
  roles: string[] = ['Admin', 'Branch Admin'];
  selectedRole: string = '';

  /* =======================
     ACCORDION STATE
  ======================== */
  activeIndex: number | null = null;

  toggleAccordion2(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  /* =======================
     MODULES + PERMISSIONS
  ======================== */
  modules: any[] = [
    {
      key: 'dashboard',
      name: 'Dashboard',
      allowed: true
    },
    {
      key: 'staff_management',
      name: 'Staff Management',
      allowed: true
    },
    {
      key: 'person_tracking',
      name: 'Person Tracking',
      allowed: true
    },
    {
      key: 'get_details',
      name: 'Get Details',
      allowed: true
    },
    {
      key: 'master',
      name: 'Master',
      children: [
        { key: 'add_company', name: 'Add Company', allowed: false },
        { key: 'add_location', name: 'Add Location', allowed: false },
        { key: 'add_contractor', name: 'Add Contractor', allowed: false },
        { key: 'add_department', name: 'Add Department', allowed: false },
        { key: 'add_access_group', name: 'Add Access Group', allowed: false },
        { key: 'role_master', name: 'Role Master', allowed: false }
      ]
    },
    {
      key: 'attendance_management',
      name: 'Attendance Management',
      children: [
        { key: 'download_log', name: 'Download Log', allowed: false },
        { key: 'log_records', name: 'Log Records', allowed: false },
        { key: 'org_unit', name: 'Organization Unit', allowed: false }
      ]
    },
    {
      key: 'system_settings',
      name: 'System Settings',
      children: [
        { key: 'device_management', name: 'Device Management', allowed: false },
        { key: 'employee_transfer', name: 'Employee Transfer Data', allowed: false },
        { key: 'smtp_credentials', name: 'SMTP Credentials', allowed: false },
        { key: 'smtp_email', name: 'SMTP Email Id', allowed: false }
      ]
    },
    {
      key: 'report',
      name: 'Report',
      children: [
        { key: 'attendance_report', name: 'Attendance Report', allowed: false },
        { key: 'multiple_punch_report', name: 'Multiple Punches Report', allowed: false },
        { key: 'master_report', name: 'Master Report', allowed: false },
        { key: 'access_control_report', name: 'Access Control Report', allowed: false },
        { key: 'access_granted_report', name: 'Access Granted Report', allowed: false },
        { key: 'audit_report', name: 'Audit Report', allowed: false },
        { key: 'person_tracking_report', name: 'Person Tracking Report', allowed: false }
      ]
    }
  ];

  /* =======================
     GENERATED JSON
  ======================== */
  permissionsJson: any = {};

  updatePermissions() {
    const permissions: any = {};

    this.modules.forEach(module => {
      if (module.children) {
        permissions[module.key] = {};
        module.children.forEach((child: any) => {
          permissions[module.key][child.key] = child.allowed;
        });
      } else {
        permissions[module.key] = module.allowed;
      }
    });

    this.permissionsJson = {
      role: this.selectedRole,
      permissions
    };
  }


  /* =======================
     ROLE CHANGE HANDLER
  ======================== */

  onRoleChange() {

    // Example preset roles
    if (this.selectedRole === 'Admin') {
      this.setAllPermissions(true);
    }

    if (this.selectedRole === 'Branch Admin') {
      this.setAllPermissions(false);
      this.allowBranchAdminDefaults();
    }

    this.updatePermissions();
  }

  /* =======================
     HELPERS
  ======================== */
  setAllPermissions(value: boolean) {
    this.modules.forEach(module => {
      if (module.children) {
        module.children.forEach((c: any) => c.allowed = value);
      } else {
        module.allowed = value;
      }
    });
  }

  allowBranchAdminDefaults() {
    this.modules.forEach(module => {
      if (module.key === 'dashboard') module.allowed = true;

      if (module.key === 'attendance_management') {
        module.children.forEach((c: any) => {
          if (['download_log', 'log_records'].includes(c.key)) {
            c.allowed = true;
          }
        });
      }
    });
  }


  saveRolePermissions() {

  this.updatePermissions(); 

  if (!this.selectedRole) {
   this.toaster.error('Please select at least one role');
    return;
  }

  console.log("ROLE DATA....", this.permissionsJson)

  this.dataService.saveRolePermissions(this.permissionsJson)
    .subscribe({
      next: (res:any) => {
        this.toaster.success(res.msg || 'Role permissions saved successfully...!')
      },
      error: (res:any) => {
    this.toaster.error(res.msg || 'Error while saving permissions..!')
      }
    });
  }





















































  showFormData: boolean = false;
  showTableData: boolean = true;
  isEditMode:boolean = false;
  roleId:any;
  // table columns
  displayedColumns: string[] = [
    'Srno',
    'campanyName',
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
  UsernameNew:any
  PrentData:any = "Parent Data add company data"
form!: FormGroup;
@ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private fb: FormBuilder, private toaster:ToastrService, private roleService:DataService, private dataService:DataService) {
    this.form = this.fb.group({
      roleName: ['', [Validators.required,]],
    });
  }

  ngOnInit(): void {
   this.getallData()
  }


  getallData(){
    this.dataService.getAllData('getAllRoleName').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllList = res.extend.RoleName;
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
      const errorMsg = err.error.msg || 'Faild to load Company list !'
      this.toaster.error(errorMsg)
    })
  )
  }

onSubmit(){

if(this.form.valid){
 const formData = {
  ...this.form.value
 }
 this.dataService.addData('addRoleName', formData).subscribe((res:any)=>{
  if(res.code === 100){
    this.toaster.success(res.msg || 'RoleName  add sucessfully !')
        // this.backtoList();

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
this.roleId = id;
  this.showFormData = true;
    this.showTableData = false;
    this.isEditMode = true;

    if(id){
      this.dataService.getById(`getRoleNameById/${id}`).subscribe((res:any)=>{
        if(res){
        const categoryData = res.extend.RoleName
    this.form.patchValue({
      roleName : categoryData.roleName,
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
     id:this.roleId,
   ...this.form.value
    }
    this.dataService.updateData('updateRoleName',fromData).subscribe((res:any)=>{
      if(res.code == 200){
        this.toaster.success(res.msg || 'Company Data Update Sucessfully !')
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
this.dataService.deleteData(`deleteRoleNameById/${id}`).subscribe((res:any)=>{
  if(res.code === 100){
 this.toaster.success(res.msg || 'Data deleted successfully !')
  this.getallData();
     this.backtoList()

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
      item.roleName.toLowerCase().includes(value)
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

















 selectedOption: string = 'Select Role';
  dropdownOpen: boolean = false;



  // date select dropdown ...

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(option: string) {
    this.selectedOption = option;
    if (option !== 'Select Role') {
      this.dropdownOpen = false;
    }
  }

  onDateChange(event: any) {
    const selectedRole = event.target.value;
    this.selectedOption = selectedRole;
    this.dropdownOpen = false;
  }





  toggleAccordion(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }
}


