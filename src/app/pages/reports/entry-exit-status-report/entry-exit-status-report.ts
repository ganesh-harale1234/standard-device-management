import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

maxDate: string = new Date().toISOString().split('T')[0];
fromDateValue: string = new Date().toISOString().split('T')[0];
toDateValue: string = new Date().toISOString().split('T')[0];

  reportData :any[] = [];
 dataSource: any
constructor(private dataService:DataService, private toaster:ToastrService){

}




locationID:any;
RoleName:any;
locationName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');
  this.locationName =  sessionStorage.getItem('locationName');
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

  const branchId = this.RoleName === 'Branch Admin'
    ? this.locationID
    : this.selectedLocationIds;

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

  if (branchId == null || branchId === '') {
    this.employeeList = [];
    this.searchDone = false;
    this.showDropdown = false;
    this.isEmpLoading = false;
    this.toaster.error('Please select branch');
    return;
  }

  // debounce logic (400ms)
  this.searchEmpTimer = setTimeout(() => {

    this.isEmpLoading = true;
    this.searchDone = false;
    this.showDropdown = true;
    this.employeeList = [];
    this.selectedEmployeeId = null;

    this.dataService.getAllData(`searchByNameOrId/${trimmed}?locationId=${branchId}`).subscribe(
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


formatDateToYMD(date: Date | null): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();

  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

exportPdfFromSelectedRange(): void {
  const fromDate = this.formatDateToYMD(this.fromDate) ?? undefined;
  const toDate = this.formatDateToYMD(this.toDate) ?? undefined;

  this.onExportPdfFromJson(
    this.reportData,
    fromDate,
    toDate,
    this.selectedCategoryNames.join(',')
  );
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
workingHoursSetTime:any;

getLocationId(){
  this.getworkingHoursTime()
}

getworkingHoursTime() {

  this.dataService.getAllData(`findWorkingHoursBranch?locationId=${this.selectedLocationIds}`).subscribe(
    (res: any) => {
      if (res.code === 100) {
        this.workingHoursSetTime = res.extend.workingHours;
      }
      
    
      else if (res.code === 200) {
        this.toaster.error(res.extend.msg);
      } else {
        this.toaster.error('Something went wrong!');
      }
    },
    (err) => {
      // this.toaster.error(err.error.msg || 'Failed to load location list!');
    }
  );
}







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
      // this.toaster.error(err.error.msg || 'Failed to load location list!');
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
    this.toaster.error('No data available for export');
    return;
  }

  const branchName = this.getSelectedLocationName() || 'All';
  const fDate = this.fromDate
    ? `${this.fromDate.getDate().toString().padStart(2, '0')} ${this.fromDate.toLocaleString('en-US', { month: 'short' })}, ${this.fromDate.getFullYear()}`
    : 'N/A';
  const tDate = this.toDate
    ? `${this.toDate.getDate().toString().padStart(2, '0')} ${this.toDate.toLocaleString('en-US', { month: 'short' })}, ${this.toDate.getFullYear()}`
    : 'N/A';
  const reportDate = new Date();
  const amPm = reportDate.getHours() >= 12 ? 'PM' : 'AM';
const reportTime = `${reportDate.getDate().toString().padStart(2, '0')} ${reportDate.toLocaleString('en-US', { month: 'short' })}, ${reportDate.getFullYear()} , ${reportDate.getHours() % 12 || 12}:${reportDate.getMinutes().toString().padStart(2, '0')} ${amPm}`;

  // Excel Data
  const excelData = this.reportData.map((item: any, index: number) => {

    return [
      index + 1,
      item.empId ?? '',
      item.employeeName ?? '',
      item.designation ?? '',
      item.locationName ?? '',
      item.attendanceDate ?? '',
      item.firstIn ?? '',
      item.lastOut ?? '',
      item.entryCount ?? 0,
      item.exitCount ?? 0,
      item.totalCount ?? 0,
      item.duplicateInCount ?? 0,
      item.duplicateOutCount ?? 0,
      item.duplicateTotalCount ?? 0,
      item.inCampusDuration ?? '',
      item.outCampusDuration ?? ''
    ];

  });

  // Header Rows
  const headerRows = [
    [
      'Sr. No.',
      'Employee Id',
      'Employee Name',
      'Designation',
      'Branch Name',
      'Date',
      'First In',
      'Last Out',
      'Count',
      '',
      '',
      'Duplicates',
      '',
      '',
      'Working Duration (Hours)',
      ''
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Entry',
      'Exits',
      'Total',
      'In',
      'Out',
      'Total',
      'In Campus',
      'Out Campus'
    ]
  ];

  // Combine Header + Data
  const sheetData = [
    [],
    [],
    [],
    [],
    ...headerRows,
    ...excelData
  ];

  // Create Worksheet
  const worksheet: XLSX.WorkSheet =
    XLSX.utils.aoa_to_sheet(sheetData);

  // Report Information
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [
        `Entry Exit Status Report`
      ],
      [
        `From Date: ${fDate} to ${tDate}`
      ],
      [
        `Branch Name: ${branchName}`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        `Report Time: ${reportTime}`,
        '',
        ''
      ]
    ],
    {
      origin: 'A1'
    }
  );

  // =========================================================
  // MERGES
  // =========================================================
  worksheet['!merges'] = [

    // COUNT = I5:K5
    {
      s: { r: 4, c: 8 },
      e: { r: 4, c: 10 }
    },

    // DUPLICATES = L5:N5
    {
      s: { r: 4, c: 11 },
      e: { r: 4, c: 13 }
    },

    // WORKING DURATION = O5:P5
    {
      s: { r: 4, c: 14 },
      e: { r: 4, c: 15 }
    },

    // Sr. No. = A5:A6
    {
      s: { r: 4, c: 0 },
      e: { r: 5, c: 0 }
    },

    // Employee Id = B5:B6
    {
      s: { r: 4, c: 1 },
      e: { r: 5, c: 1 }
    },

    // Employee Name = C5:C6
    {
      s: { r: 4, c: 2 },
      e: { r: 5, c: 2 }
    },

    // Designation = D5:D6
    {
      s: { r: 4, c: 3 },
      e: { r: 5, c: 3 }
    },

    // Branch Name = E5:E6
    {
      s: { r: 4, c: 4 },
      e: { r: 5, c: 4 }
    },

    // Date = F5:F6
    {
      s: { r: 4, c: 5 },
      e: { r: 5, c: 5 }
    },

    // FIRST IN = G5:G6
    {
      s: { r: 4, c: 6 },
      e: { r: 5, c: 6 }
    },

    // LAST OUT = H5:H6
    {
      s: { r: 4, c: 7 },
      e: { r: 5, c: 7 }
    },

    // Report Title = A1:P1
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 15 }
    },

    // From Date = A2:P2
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 15 }
    },

    // Branch Name = A3:M3
    {
      s: { r: 2, c: 0 },
      e: { r: 2, c: 12 }
    },

    // Report Time = N3:P3
    {
      s: { r: 2, c: 13 },
      e: { r: 2, c: 15 }
    }
  ];

  // Column Widths
  worksheet['!cols'] = [
    { wch: 8 },  // Sr. No.
    { wch: 16 }, // Employee Id
    { wch: 24 }, // Employee Name
    { wch: 18 }, // Designation
    { wch: 16 }, // Branch Name
    { wch: 13 }, // Date
    { wch: 12 }, // First In
    { wch: 12 }, // Last Out
    { wch: 10 }, // Entry
    { wch: 10 }, // Exits
    { wch: 10 }, // Total
    { wch: 10 }, // Duplicates IN
    { wch: 10 }, // Duplicates OUT
    { wch: 10 }, // Duplicates Total
    { wch: 16 }, // In Campus
    { wch: 16 }  // Out Campus
  ];

  // Create Workbook
  const workbook: XLSX.WorkBook =
    XLSX.utils.book_new();

  // Add Worksheet
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
if (this.RoleName !== 'Branch Admin' && this.selectedLocationIds == null) {
  this.toaster.error('Please select a Branch');
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
  const locationId =
  this.RoleName === 'Branch Admin'
    ? this.locationID
    : this.selectedLocationIds;

  // Category + Employee
  if (this.selectedCategoryIds?.length > 0 && this.selectedEmployeeId) {

    apiUrl = 'getAttendanceReport';

    requestData = {
      fromDate,
      toDate,
      categoryIdList: this.selectedCategoryIds,
      locationId: locationId,
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
                    // this.toaster.error(res.msg || 'Something went wrong!');

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
                    // this.toaster.error(res.msg || 'Something went wrong!');

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

    apiUrl = `campusAttendanceDetailed?fromDate=${fromDate}&toDate=${toDate}&categoryIds=${categoryIds}&locationIds=${locationId}`;
  }

  // Location Only
  else {

    apiUrl = `campusAttendanceDetailed?fromDate=${fromDate}&toDate=${toDate}&locationIds=${locationId}`;
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
                    // this.toaster.error(res.msg || 'Something went wrong!');

        }

    },
    error: (err) => {
      this.toaster.error(err.error?.msg || 'Server Error');
    }
  });

}





// onExportPdf() {
//   const DATA: any = document.getElementById('contentToConvert');

//   if (!DATA) {
//     console.error('contentToConvert element not found');
//     return;
//   }

//   html2canvas(DATA, {
//     scale: 2,
//     useCORS: true,
//     allowTaint: true,
//     backgroundColor: '#ffffff'
//   }).then((canvas) => {

//     const imgData = canvas.toDataURL('image/png');

//     const pdf = new jsPDF('p', 'mm', 'a4');

//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     // Canvas image height according to PDF width
//     const imgHeight = (canvas.height * pdfWidth) / canvas.width;

//     let heightLeft = imgHeight;
//     let position = 0;

//     // First page
//     pdf.addImage(
//       imgData,
//       'PNG',
//       0,
//       position,
//       pdfWidth,
//       imgHeight
//     );

//     heightLeft -= pdfHeight;

//     // Remaining pages
//     while (heightLeft > 0) {

//       position = heightLeft - imgHeight;

//       pdf.addPage();

//       pdf.addImage(
//         imgData,
//         'PNG',
//         0,
//         position,
//         pdfWidth,
//         imgHeight
//       );

//       heightLeft -= pdfHeight;
//     }

//     pdf.save('Entry Exit Status Report.pdf');
//   });
// }




getSelectedLocationName() {

  if (this.RoleName === 'Branch Admin') {
    return this.locationName || '';
  }

  return this.locationLists.find(
    (x: any) => x.locationId === this.selectedLocationIds
  )?.locationName || '';
}


onExportPdfFromJson(
  apiData: any[],
  fromDate?: string,
  toDate?: string,
  categoryName?: string
): void {

  
  if (!apiData || apiData.length === 0) {
    this.toaster.error('No data available to export');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginLeft = 5;
  const marginRight = 5;
  const marginBottom = 12;

  
  const firstPageTableStartY = 27;


  const otherPageTopMargin = 5;

  const availableWidth =
    pageWidth - marginLeft - marginRight;


  const formatHeaderDate = (value?: string): string => {

    if (!value) {
      return 'N/A';
    }

    const date = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T00:00:00`
        : value
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return `${date
      .getDate()
      .toString()
      .padStart(2, '0')} ${date.toLocaleString(
      'en-US',
      { month: 'short' }
    )}, ${date.getFullYear()}`;
  };

  const branchName =
    apiData[0]?.locationName || 'All';

  const fDate =
    formatHeaderDate(
      fromDate || apiData[0]?.attendanceDate
    );

  const tDate =
    formatHeaderDate(
      toDate || apiData[0]?.attendanceDate
    );

  const category =
    categoryName ||
    'Student, Contractor, A, General';


  const reportDate = new Date();

  const hours = reportDate.getHours();

  const minutes = reportDate
    .getMinutes()
    .toString()
    .padStart(2, '0');

  const amPm =
    hours >= 12 ? 'PM' : 'AM';

  const reportTime =
    `${reportDate.getDate()
      .toString()
      .padStart(2, '0')} ` +
    `${reportDate.toLocaleString(
      'en-US',
      { month: 'short' }
    )}, ` +
    `${reportDate.getFullYear()}, ` +
    `${hours % 12 || 12}:${minutes} ${amPm}`;

  const drawReportHeader = () => {

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);

    doc.text(
      'Entry Exit Status Report',
      pageWidth / 2,
      8,
      {
        align: 'center'
      }
    );


    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text(
      `From Date: ${fDate} to ${tDate}`,
      pageWidth / 2,
      13,
      {
        align: 'center'
      }
    );


    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text(
      `Branch Name: ${branchName}`,
      marginLeft,
      19
    );


    doc.text(
      `Report Time: ${reportTime}`,
      pageWidth - marginRight,
      19,
      {
        align: 'right'
      }
    );


    doc.setDrawColor(180, 180, 180);

    doc.line(
      marginLeft,
      22,
      pageWidth - marginRight,
      22
    );
  };


  const head = [

    [
      {
        content: `Category Name : ${category}`,
        colSpan: 16,
        styles: {
          halign: 'center',
          fontStyle: 'bold'
        }
      }
    ],

    [
      { content: 'SR. NO', rowSpan: 2 },
      { content: 'Employee Id', rowSpan: 2 },
      { content: 'Employee Name', rowSpan: 2 },
      { content: 'Designation', rowSpan: 2 },
      { content: 'Branch Name', rowSpan: 2 },
      { content: 'Date', rowSpan: 2 },
      { content: 'First In', rowSpan: 2 },
      { content: 'Last Out', rowSpan: 2 },

      {
        content: 'Count',
        colSpan: 3
      },

      {
        content: 'Duplicates',
        colSpan: 3
      },

      {
        content: 'Working Duration (Hours)',
        colSpan: 2
      }
    ],


    [
      { content: 'Entry' },
      { content: 'Exits' },
      { content: 'Total' },

      { content: 'In' },
      { content: 'Out' },
      { content: 'Total' },

      { content: 'In Campus' },
      { content: 'Out Campus' }
    ]
  ];


  const body = apiData.map(
    (item: any, index: number) => [

      index + 1,

      item.empId ?? '-',

      item.employeeName ?? '-',

      item.designation ?? '-',

      item.locationName ?? '-',

      formatHeaderDate(item.attendanceDate),

      item.firstIn ?? '-',

      item.lastOut ?? '-',

      item.entryCount ?? 0,

      item.exitCount ?? 0,

      item.totalCount ?? 0,

      item.duplicateInCount ?? 0,

      item.duplicateOutCount ?? 0,

      item.duplicateTotalCount ?? 0,

      item.inCampusDuration ?? '00:00',

      item.outCampusDuration ?? '00:00'
    ]
  );


  drawReportHeader();


  autoTable(doc, {

    head: head as any,

    body: body,

   
    startY: firstPageTableStartY,

    theme: 'grid',

    tableWidth: availableWidth,


    styles: {

      fontSize: 7,

      cellPadding: {
        top: 1.8,
        right: 1.2,
        bottom: 1.8,
        left: 1.2
      },

      overflow: 'linebreak',

      valign: 'middle',

      halign: 'center',

      lineWidth: 0.15,

      lineColor: [190, 190, 190]
    },



    headStyles: {

      fillColor: [31, 134, 180],

      textColor: [255, 255, 255],

      fontStyle: 'bold',

      fontSize: 7.5,

      halign: 'center',

      valign: 'middle',

      lineWidth: 0.2,

      lineColor: [0, 100, 150]
    },


    columnStyles: {

      0: { cellWidth: 9 },

      1: { cellWidth: 17 },

      2: {
        cellWidth: 37,
        halign: 'left'
      },

      3: {
        cellWidth: 20,
        halign: 'left'
      },

      4: {
        cellWidth: 52,
        halign: 'left'
      },

      5: { cellWidth: 18 },

      6: { cellWidth: 14 },

      7: { cellWidth: 14 },

      8: { cellWidth: 11 },

      9: { cellWidth: 11 },

      10: { cellWidth: 11 },

      11: { cellWidth: 11 },

      12: { cellWidth: 11 },

      13: { cellWidth: 11 },

      14: { cellWidth: 20 },

      15: { cellWidth: 20 }
    },

    margin: {

      // Used for page 2 onwards
      top: otherPageTopMargin,

      left: marginLeft,

      right: marginRight,

      bottom: marginBottom
    },


    pageBreak: 'auto',

    rowPageBreak: 'avoid',


   
    showHead: 'firstPage',


    didParseCell: (data: any) => {

      if (data.section === 'body') {

        if (data.column.index === 2) {
          data.cell.styles.halign = 'left';
        }

        if (data.column.index === 3) {
          data.cell.styles.halign = 'left';
        }

        if (data.column.index === 4) {
          data.cell.styles.halign = 'left';
        }
      }
    },


    didDrawPage: () => {

      const currentPage =
        doc.getCurrentPageInfo().pageNumber;

      doc.setFont('helvetica', 'normal');

      doc.setFontSize(7);

      doc.text(
        `Page ${currentPage}`,
        pageWidth - marginRight,
        pageHeight - 5,
        {
          align: 'right'
        }
      );
    }
  });


  doc.save('Entry_Exit_Status_Report.pdf');
}



}

