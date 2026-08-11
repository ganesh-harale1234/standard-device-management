import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-contractor-wise-report',
  imports: [CommonModule, SharedModule, FormsModule,NgSelectModule],

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

 locationID:any;
RoleName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');
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


// Location List
locationList: any[] = [ ]
// Selected IDs
selectedLocationIds: string[] = [];

// Get Locations
getallDataLocation() {

  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `findAllLocation?locationId=${this.locationID}`;
  } else {
    apiUrl = 'findAllLocation';
  }

  this.dataService.getAllData(apiUrl).subscribe(
    (res: any) => {
      if (res.code === 100) {
            this.locationList = res.extend.data;
      } else if (res.code === 500) {
        this.toaster.error('Internal server error!');
      } else {
        this.toaster.error('Something went wrong!');
      }
    },
    (err) => {
      this.toaster.error(err.error.msg || 'Failed to load location list!');
    }
  );
}

// Select All
toggleSelectAllLocations() {

  if (this.isAllLocationSelected()) {

    this.selectedLocationIds = [];

  } else {

    this.selectedLocationIds = this.locationList.map(
      (x: any) => x.locationId
    );

  }

  console.log(this.selectedLocationIds);

}

// Check All Selected
isAllLocationSelected(): boolean {

  return (
    this.locationList.length > 0 &&
    this.selectedLocationIds.length === this.locationList.length
  );

}
onLocationChange(event: any) {
  this.selectedLocationName = event.locationName;
}



// AuditReport() {
//   this.reportData = [];

//   const fromDate = this.formatDateToYMD(this.fromDate);
//   const toDate = this.formatDateToYMD(this.toDate);

//   let apiUrl: string;
//   let requestData: any = { fromDate, toDate };

//   // Employee
//   if (this.selectedEmployeeId) {
//     apiUrl = 'getEmpWiseMultiplePunchReport';
//     requestData.empId = this.selectedEmployeeId;
//   }

//   // Contractor
//   else if (this.selectedDeptId) {
//     apiUrl = 'contractorWiseReport'; // Contractor API
// requestData.conId = Number(this.selectedDeptId);  }

//   // Date only
//   else {
//     apiUrl = 'contractorWiseReport';
//   }

//   this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {
//     if (res.code === 100) {
//       this.reportData = res.extend?.contractorReportList || [];
//     } else {
//       this.toaster.error(res.msg || 'Something went wrong!');
//     }
//   }, (err: any) => {
//     this.toaster.error(err?.error?.msg || 'Server side error!');
//   });
// }

onExportExcel(){
  
}


AuditReport() {

  this.reportData = [];

  // Branch Mandatory
  if (!this.selectlocationId) {
    this.toaster.error('Please select Branch');
    return;
  }

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  let apiUrl = '';
  let requestData: any = {
    fromDate,
    toDate,
    locationId: this.selectlocationId
  };

  // Employee
  if (this.selectedEmployeeId) {

    apiUrl = 'getEmpWiseMultiplePunchReport';

    requestData = {
      fromDate,
      toDate,
      locationId: this.selectlocationId,
      empId: this.selectedEmployeeId
    };

  }

  // Contractor
  else if (this.selectedDeptId) {

    apiUrl = 'contractorWiseReport';

    requestData = {
      fromDate,
      toDate,
      locationId: this.selectlocationId,
      conId: Number(this.selectedDeptId)
    };

  }

  // Date + Location
  else {

    apiUrl = 'contractorWiseReport';

    requestData = {
      fromDate,
      toDate,
      locationId: this.selectlocationId
    };

  }

  this.dataService.addData(apiUrl, requestData).subscribe({
    next: (res: any) => {

      if (res.code === 100) {
        this.reportData = res.extend?.contractorReportList || [];
      } else {
        this.toaster.error(res.msg || 'Something went wrong!');
      }

    },
    error: (err: any) => {
      this.toaster.error(err?.error?.msg || 'Server side error!');
    }
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

    pdf.save('Contractor Wise Report.pdf');
  });
}

selectedLocationName = '';
selectlocationId: number | null = null;
getSelectedLocationName() {
  return this.locationList.find(
    (x: any) => x.locationId === this.selectlocationId
  )?.locationName;
}


}
