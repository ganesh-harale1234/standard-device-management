import { Component, ElementRef, ViewChild } from '@angular/core';
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



locationID:any;
RoleName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');
  this.getallDataLocation();
  this.roleId = sessionStorage.getItem('rollId')
  this.getallData()
  this.getallDataLocations();

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

// Location List
locationLists: any[] = [ ]
// Selected IDs
selectedLocationIds: any;

// Get Locations
getallDataLocations() {
   let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `findAllLocation?locationId=${this.locationID}`;
  } else {
    apiUrl = 'findAllLocation';
  }

  this.dataService.getAllData(apiUrl).subscribe(
    (res: any) => {
      if (res.code === 100) {
        this.locationLists = res.extend.data;
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

    this.selectedLocationIds = "";

  } else {

    this.selectedLocationIds = this.locationLists.map(
      (x: any) => x.locationId
    );

  }

  console.log(this.selectedLocationIds);

}

// Check All Selected
isAllLocationSelected(): boolean {

  return (
    this.locationLists.length > 0 &&
    this.selectedLocationIds.length === this.locationLists.length
  );

}

onExportExcel(): void {

  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No  data available for export');
    return;
  }

  // Excel data
  const excelData = this.reportData.map((item: any, index: number) => {

    return [
      index + 1,
      item.employeeName ?? '',
      item.designation ?? '',
      item.locationName ?? '',
      item.attendanceDate ?? '',
      item.entryCount ?? 0,
      item.exitCount ?? 0,
      item.totalCount ?? 0,
      item.inCampusDuration ?? '',
      item.outCampusDuration ?? ''
    ];

  });

  // Header rows
  const headerRows = [
    [
      'SR. NO.',
      'NAME OF EMPLOYEE',
      'DESIGNATION',
      'Branch Name',
      'Date',
      'COUNT',
      '',
      '',
      'WORKING DURATION (HOURS)',
      ''
    ],
    [
      '',
      '',
      '',
      '',
      '',
      'ENTRY',
      'EXITS',
      'TOTAL',
      'IN CAMPUS',
      'OUT CAMPUS'
    ]
  ];

  // Combine header + data
  const sheetData = [
    ...headerRows,
    ...excelData
  ];

  // Create worksheet
  const worksheet: XLSX.WorkSheet =
    XLSX.utils.aoa_to_sheet(sheetData);

  // Merge COUNT
  worksheet['!merges'] = [
    {
      s: { r: 0, c: 5 },
      e: { r: 0, c: 7 }
    },

    // Merge WORKING DURATION
    {
      s: { r: 0, c: 8 },
      e: { r: 0, c: 9 }
    },

    // Merge vertical headers
    {
      s: { r: 0, c: 0 },
      e: { r: 1, c: 0 }
    },
    {
      s: { r: 0, c: 1 },
      e: { r: 1, c: 1 }
    },
    {
      s: { r: 0, c: 2 },
      e: { r: 1, c: 2 }
    },
    {
      s: { r: 0, c: 3 },
      e: { r: 1, c: 3 }
    },
    {
      s: { r: 0, c: 4 },
      e: { r: 1, c: 4 }
    }
  ];

  // Column widths
  worksheet['!cols'] = [
    { wch: 10 }, // SR NO.
    { wch: 25 }, // NAME OF EMPLOYEE
    { wch: 25 }, // DESIGNATION
    { wch: 18 }, // Branch Name
    { wch: 15 }, // Date
    { wch: 12 }, // ENTRY
    { wch: 12 }, // EXITS
    { wch: 12 }, // TOTAL
    { wch: 20 }, // IN CAMPUS
    { wch: 20 }  // OUT CAMPUS
  ];

  // Create workbook
  const workbook: XLSX.WorkBook =
    XLSX.utils.book_new();

  // Add worksheet
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Attendance Report'
  );

  // Download Excel
  XLSX.writeFile(
    workbook,
    'Entry_Exit_Status_Report.xlsx'
  );
}

AttendencesReport() {

  this.reportData = [];

  // Branch Mandatory
  if (!this.selectedLocationIds) {
    this.toaster.error('Please select Branch');
    return;
  }


if (!this.selectedCategoryIds || this.selectedCategoryIds.length === 0) {
  this.toaster.error('Please select one category...!');
  return;
}

  

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  let apiUrl = '';
  let requestData: any = {};

  // Category + Employee
  if (this.selectedCategoryIds?.length > 0 && this.selectedEmployeeId) {

    apiUrl = 'getAttendanceReport';

    requestData = {
      fromDate,
      toDate,
      categoryIdList: this.selectedCategoryIds,
      locationId: this.selectedLocationIds,
      employeeId: this.selectedEmployeeId
    };

    this.dataService.addData(apiUrl, requestData).subscribe({
      next: (res: any) => {
        this.reportData = res || [];
         if (res.code === 100) {
            this.reportData = res.extend.campusAttendance || [];
        } else if(res.code ===200) {
                                          this.toaster.error(res.msg);

            this.reportData = [];

        }else{
                    this.toaster.error(res.msg || 'Something went wrong!');

        }
        
      },
      error: (err) => {
        this.toaster.error(err.error?.msg || 'Server Error');
      }
    });

    return;
  }

  // Employee Only
  if (this.selectedEmployeeId) {

    apiUrl = 'getEmpWiseMultiplePunchReport';

    requestData = {
      fromDate,
      toDate,
      employeeId: this.selectedEmployeeId
    };

    this.dataService.addData(apiUrl, requestData).subscribe({
      next: (res: any) => {
        this.reportData = res || [];

          if (res.code === 100) {
             this.reportData = res.extend.campusAttendance || [];
        } else if(res.code ===200) {
                                          this.toaster.error(res.msg);

            this.reportData = [];

        }else{
                    this.toaster.error(res.msg || 'Something went wrong!');

        }


      },
      error: (err) => {
        this.toaster.error(err.error?.msg || 'Server Error');
      }
    });

    return;
  }

  // Category + Location
  if (this.selectedCategoryIds?.length > 0) {

    const categoryIds = this.selectedCategoryIds.join(',');

    apiUrl = `campusAttendance?fromDate=${fromDate}&toDate=${toDate}&categoryIds=${categoryIds}&locationIds=${this.selectedLocationIds}`;
  }

  // Location Only
  else {

    apiUrl = `campusAttendance?fromDate=${fromDate}&toDate=${toDate}&locationIds=${this.selectedLocationIds}`;
  }

  this.dataService.getAllData(apiUrl).subscribe({
    next: (res: any) => {
      this.reportData = res || [];
       if (res.code === 100) {
      
          this.reportData = res.extend.campusAttendance || [];
        } else if(res.code ===200) {
                                          this.toaster.error(res.msg);

            this.reportData = [];

        }else{
                    this.toaster.error(res.msg || 'Something went wrong!');

        }

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

selectlocationId: number | null = null;
selectedLocationName = '';

getSelectedLocationName() {
  return this.locationLists.find(
    (x: any) => x.locationId === this.selectedLocationIds
  )?.locationName;
}


}
