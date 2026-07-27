import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contractor-wise-report',
  imports: [CommonModule, SharedModule, FormsModule],

  templateUrl: './contractor-wise-report.html',
  styleUrl: './contractor-wise-report.scss',
})
export class ContractorWiseReport {
 locations = [];
  selectedLocationId: number | null = null;
  searchText = '';
 roleId:any;
 searchTextemp: string = '';
employeeList: any[] = [];
isEmpLoading: boolean = false;
searchDone: boolean = false;
selectedEmployeeId: string | null = null;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  now: Date = new Date();

  reportData:any[] = [];
 dataSource: any
constructor(private dataService:DataService, private toaster:ToastrService){

}

getAllListdepartment:any[] = []

  ngOnInit(): void {
  this.getallDataLocation();
  this.getallDatadepartment();
  this.roleId = sessionStorage.getItem('rollId')

  }

     getallDatadepartment(){
    this.dataService.getAllData('findAllcontractors').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllListdepartment = res.extend.allContractors;
         
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, 
  )
  }

  selectedDeptId:any;

  getContractorId(event:any){
    this.selectedDeptId = event.target.value;
  }

showDropdown: boolean = false;

onSearchEmp(event: any) {
  const trimmed = event.target.value.trim();
  this.searchTextemp = trimmed;

  if (!trimmed) {
    this.employeeList = [];
    this.searchDone = false;
    this.showDropdown = false;   
    return;
  }

  this.isEmpLoading = true;
  this.searchDone = false;
  this.showDropdown = true;   
  this.employeeList = [];
  this.selectedEmployeeId = null;

  this.dataService.getAllData(`searchByNameOrId/${trimmed}`).subscribe(
    (res: any) => {
      this.isEmpLoading = false;
      this.searchDone = true;
  
      if (res.code === 100 && Array.isArray(res.extend.employeeList)) {
        this.employeeList = res.extend.employeeList;
      } else {
        this.employeeList = [];
      }
    },
    (err: any) => {
      this.isEmpLoading = false;
      this.searchDone = true;
      this.employeeList = [];
      this.selectedEmployeeId = null;
      this.showDropdown = false;

      const msg = err.error?.msg || 'Failed to search employee';
      this.toaster.error(msg);
    }
  );
}


onSelectEmployee(emp: any) {
  this.selectedEmployeeId = emp.userId;
  this.searchTextemp = `${emp.name} (${emp.userId})`;
  console.log('Selected Employee Id:', this.selectedEmployeeId);
  this.employeeList = [];
  this.searchDone = false;
  this.showDropdown = false;     
}


formatDateToYMD(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();

  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// Location list
locationList: any[] = [];

selectedLocationIds: string[] = [];

getallDataLocation() {
  this.dataService.getAllData('findAllLocation').subscribe(
    (res: any) => {
      if (res.code === 100) {
        this.locationList = res.extend.data;
      } else if (res.code === 500) {
        this.toaster.error('Internal server error !');
      } else {
        this.toaster.error('Something went wrong !');
      }
    },
    (err) => {
      const errorMsg = err.error.msg || 'Failed to load Location list !';
      this.toaster.error(errorMsg);
    }
  );
}

// ---- Select All flag ----
get isAllSelected(): boolean {
  return (
    this.selectedLocationIds.length === this.locationList.length &&
    this.locationList.length > 0
  );
}

isSelected(id: string): boolean {
  return this.selectedLocationIds.includes(id);
}

toggleLocation(id: string, event: any): void {
  const checked = event.checked;

  if (checked) {
    if (!this.selectedLocationIds.includes(id)) {
      this.selectedLocationIds = [...this.selectedLocationIds, id];
    }
  } else {
    this.selectedLocationIds = this.selectedLocationIds.filter(
      (locId) => locId !== id
    );
  }

  console.log('Selected Location IDs : ', this.selectedLocationIds);
}

// ---- Select All toggle ----
toggleSelectAll(event: any): void {
  const checked = event.checked;

  if (checked) {
    this.selectedLocationIds = this.locationList.map(
      (d: any) => d.locationId
    );
  } else {
    this.selectedLocationIds = [];
  }

  console.log('Selected Location IDs (SelectAll) : ', this.selectedLocationIds);
}

getLocationName(id: string) {
  const loc = this.locationList.find((d: any) => d.locationId === id);
  return loc ? loc.locationName : id;
}



AuditReport() {
  this.reportData = [];

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  let apiUrl: string;
  let requestData: any = { fromDate, toDate };

  // Employee
  if (this.selectedEmployeeId) {
    apiUrl = 'getEmpWiseMultiplePunchReport';
    requestData.empId = this.selectedEmployeeId;
  }

  // Contractor
  else if (this.selectedDeptId) {
    apiUrl = 'getContractorWiseMultiplePunchReport'; // Contractor API
    requestData.contractorId = this.selectedDeptId;
  }

  // Date only
  else {
    apiUrl = 'auditReport';
  }

  this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {
    if (res.code === 100) {
      this.reportData = res.extend?.auditReport || [];
    } else {
      this.toaster.error(res.msg || 'Something went wrong!');
    }
  }, (err: any) => {
    this.toaster.error(err?.error?.msg || 'Server side error!');
  });
}




   
  
onExportPdf() {
  const DATA: any = document.getElementById('contentToConvert');

  html2canvas(DATA, {
    scale: 2,            
    useCORS: true
  }).then((canvas) => {

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      pdfWidth,    
      pdfHeight
    );

    pdf.save('Log Report.pdf');
  });
}

}
