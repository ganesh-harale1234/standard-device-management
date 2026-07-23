import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-entry-exit-status-report',
  imports: [CommonModule, SharedModule, FormsModule, NgSelectModule],
  templateUrl: './entry-exit-status-report.html',
  styleUrl: './entry-exit-status-report.scss',
})
export class EntryExitStatusReport {
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

  reportData :any[] = [];
 dataSource: any
constructor(private dataService:DataService, private toaster:ToastrService){

}


  ngOnInit(): void {
  this.getallDataLocation();
  this.roleId = sessionStorage.getItem('rollId')
  this.getallData()

  }
getAllList:any[] = []
  


showDropdown: boolean = false;
searchEmpTimer: any;

onSearchEmp(event: any) {
  const trimmed = event.target.value.trim();
  this.searchTextemp = trimmed;

  // clear previous timer
  if (this.searchEmpTimer) {
    clearTimeout(this.searchEmpTimer);
  }

  // empty input case
  if (!trimmed) {
    this.employeeList = [];
    this.searchDone = false;
    this.showDropdown = false;
    this.isEmpLoading = false;
    return;
  }

  // debounce logic (400ms)
  this.searchEmpTimer = setTimeout(() => {

    this.isEmpLoading = true;
    this.searchDone = false;
    this.showDropdown = true;
    this.employeeList = [];
    this.selectedEmployeeId = null;

    this.dataService.getAllData(`searchByNameOrId/${trimmed}`).subscribe(
      (res: any) => {
        this.isEmpLoading = false;
        this.searchDone = true;

        if (res.code === 100 && Array.isArray(res.extend?.employeeList)) {
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

  }, 400); // 👈 debounce time
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
selectedCategoryIds: string[] = [];

// Get Locations
getallDataLocation() {
  this.dataService.getAllData('findAllLocation').subscribe(
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


getallData() {
  this.dataService.getAllData('getAllCategory').subscribe({
    next: (res: any) => {

      if (res.code === 100) {
        this.getAllList = res.extend.allCategory || [];
      }

      else if (res.code === 500) {
        this.toaster.error('Internal server error!');
      }

      else {
        this.toaster.error('Something went wrong!');
      }

    },

    error: (err) => {
      this.toaster.error(err.error?.msg || 'Failed to load category list!');
    }
  });
}
selectedCategoryNames: string[] = [];
updateSelectedCategoryNames() {
  this.selectedCategoryNames = this.getAllList
    .filter(item => this.selectedCategoryIds.includes(item.categoryId))
    .map(item => item.categoryName);   // categoryName field
}

// Select All
toggleSelectAllCategory() {

  if (this.isAllCategorySelected()) {

    this.selectedCategoryIds = [];

  } else {

    this.selectedCategoryIds = this.getAllList.map(
      (x: any) => x.categoryId
    );

  }
 this.updateSelectedCategoryNames();
  console.log(this.selectedCategoryIds);

}
// Check All Selected
isAllCategorySelected(): boolean {
   this.updateSelectedCategoryNames();

  return (
    this.getAllList.length > 0 &&
    this.selectedCategoryIds.length === this.getAllList.length
  );

}
// AttendencesReport() {
//   const fromDate = this.formatDateToYMD(this.fromDate);
//   const toDate   = this.formatDateToYMD(this.toDate);

//   let apiUrl: string;
//   let requestData: any = { fromDate, toDate };

//   // LOCATION 
//   if (Array.isArray(this.selectedCategoryIds) && this.selectedCategoryIds.length > 0) {
//     apiUrl = 'getLocationwiseMultiplePunchesReport';
//     requestData.BranchId = this.selectedCategoryIds;
//     requestData.rollId = this.roleId;
//   }
//   // EMPLOYEE 
//   else if (this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
//     apiUrl = 'getEmpWiseMultiplePunchReport';
//     requestData.empId = this.selectedEmployeeId;
//     requestData.rollId = this.roleId;
//   }
//   //  date-based call
//   else {
//     apiUrl = 'getMultiplePunchesReport';
//   }

//   this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {
//     if (res.code == 200) {
//       this.toaster.error(res.msg);
//       return;
//     }
//     if (res.extend?.punchList) {
//       this.data = res.extend.punchList
//         .filter((item: any) => item.enrollId)
//         .map((item: any) => {
//           item.PNRNo = (item.pnrNo === 'null' ? '' : item.pnrNo);
//           return item;
//         });

//       // Only sort when no location & no employee selected
//       if (!(Array.isArray(this.selectedCategoryIds) && this.selectedCategoryIds.length > 0)
//           && (this.selectedEmployeeId == null || this.selectedEmployeeId === '')) {
//         this.data.sort((a: any, b: any) => {
//           return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
//         });
//       }

//       this.dataSource = new MatTableDataSource(this.data);
//     }
//   });
// }



AttendencesReport() {

  this.reportData = [];

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  let apiUrl = '';
  let requestData: any = {};

  // Category + Employee
  if (
    this.selectedCategoryIds?.length > 0 &&
    this.selectedEmployeeId
  ) {

    apiUrl = 'getAttendanceReport';

    requestData = {
      fromDate,
      toDate,
      categoryIdList: this.selectedCategoryIds,
      employeeId: this.selectedEmployeeId
    };

  }

  // Employee
  else if (this.selectedEmployeeId) {

    apiUrl = 'getEmpWiseMultiplePunchReport';

    requestData = {
      fromDate,
      toDate,
      employeeId: this.selectedEmployeeId
    };

  }

  // Category
  else if (this.selectedCategoryIds?.length > 0) {

    const categoryIds = this.selectedCategoryIds.join(',');

    apiUrl = `campusAttendance?fromDate=${fromDate}&toDate=${toDate}&categoryIds=${categoryIds}`;

  }

  // Only Date
  else {

    apiUrl = `campusAttendance?fromDate=${fromDate}&toDate=${toDate}`;

    requestData = {
      fromDate,
      toDate
    };

  }

  this.dataService.getAllData(apiUrl).subscribe({

    next: (res: any) => {

      

        this.reportData = res || [];


    },

    error: (err) => {

      this.toaster.error(err.error?.msg || 'Server Error');

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

    pdf.save('Entry Exit Status Report.pdf');
  });
}



}
