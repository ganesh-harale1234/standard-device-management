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
    this.toaster.error('No data available for export');
    return;
  }

  const branchName = this.getSelectedLocationName() || 'All';

  const fromDateValue = this.fromDate
    ? this.formatDateToYMD(this.fromDate)
    : null;

  const toDateValue = this.toDate
    ? this.formatDateToYMD(this.toDate)
    : null;

  const fDate = fromDateValue || 'N/A';
  const tDate = toDateValue || 'N/A';

  const reportTime = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Excel Data
  const excelData = this.reportData.map((item: any, index: number) => {

    return [
      index + 1,
      item.empId ?? '',
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

  // Header Rows
  const headerRows = [
    [
      'Sr. No.',
      'Employee Id',
      'Employee Name',
      'Designation',
      'Branch Name',
      'Date',
      'Count',
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
      'ENTRY',
      'EXITS',
      'TOTAL',
      'IN CAMPUS',
      'OUT CAMPUS'
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
        `Report Time: ${reportTime}`,
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

    // COUNT = G5:I5
    {
      s: { r: 4, c: 6 },
      e: { r: 4, c: 8 }
    },

    // WORKING DURATION = J5:K5
    {
      s: { r: 4, c: 9 },
      e: { r: 4, c: 10 }
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

    // Report Title = A1:K1
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 10 }
    },

    // From Date = A2:K2
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 10 }
    },

    // Branch Name = A3:I3
    {
      s: { r: 2, c: 0 },
      e: { r: 2, c: 8 }
    },

    // Report Time = J3:K3
    {
      s: { r: 2, c: 9 },
      e: { r: 2, c: 10 }
    }
  ];

  // Column Widths
  worksheet['!cols'] = [
    { wch: 10 }, // Sr. No.
    { wch: 18 }, // Employee Id
    { wch: 25 }, // Employee Name
    { wch: 20 }, // Designation
    { wch: 18 }, // Branch Name
    { wch: 15 }, // Date
    { wch: 12 }, // Entry
    { wch: 12 }, // Exits
    { wch: 12 }, // Total
    { wch: 20 }, // In Campus
    { wch: 20 }  // Out Campus
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

    apiUrl = `campusAttendance?fromDate=${fromDate}&toDate=${toDate}&categoryIds=${categoryIds}&locationIds=${locationId}`;
  }

  // Location Only
  else {

    apiUrl = `campusAttendance?fromDate=${fromDate}&toDate=${toDate}&locationIds=${locationId}`;
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


onExportPdfFromJson(apiData: any[], fromDate?: string, toDate?: string, categoryName?: string) {

  if (!apiData || apiData.length === 0) {
    this.toaster.error('No data available to export');
    return;
  }

  // Landscape Mode A4
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Dynamic Metadata Values
  const branchName = apiData[0]?.locationName || 'All';
  const fDate = fromDate || apiData[0]?.attendanceDate || 'Aug 18, 2026';
  const tDate = toDate || apiData[0]?.attendanceDate || 'Aug 18, 2026';
  const category = categoryName || 'Student,Contractor,A,General';
  const reportTime = new Date().toLocaleString('en-US', { 
    month: 'short', day: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });

  // ==============================
  // 1. TOP HEADER (Title & Subtitles)
  // ==============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Entry Exit Status Report', pageWidth / 2, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`From Date: ${fDate} to ${tDate}`, pageWidth / 2, 15, { align: 'center' });

  // Branch Name (Left)
  doc.setFont('helvetica', 'bold');
  doc.text('Branch Name: ', 10, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(branchName, 32, 20);

  // Report Time (Right)
  doc.setFont('helvetica', 'bold');
  doc.text(`Report Time: `, pageWidth - 70, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTime, pageWidth - 49, 20);

  // ==============================
  // 2. NESTED TABLE HEADERS ( Exact Match with Screenshot )
  // ==============================
  const head = [
    [
      { 
        content: `Category Name : ${category}`, 
        colSpan: 11, 
        styles: { halign: 'center', fillColor: [0, 150, 220], fontStyle: 'bold' } 
      }
    ],
    [
      { content: 'SR. NO', rowSpan: 2 },
      { content: 'Employee Id', rowSpan: 2 },
      { content: 'Employee Name', rowSpan: 2 },
      { content: 'Disignation', rowSpan: 2 },
      { content: 'Branch Name', rowSpan: 2 },
      { content: 'Date', rowSpan: 2 },
      { content: 'Count', colSpan: 3 },
      { content: 'Working Duration (Hours)', colSpan: 2 }
    ],
    [
      { content: 'Entry' },
      { content: 'Exits' },
      { content: 'Total' },
      { content: 'In Campus' },
      { content: 'Out Campus' }
    ]
  ];

  // ==============================
  // 3. API DATA MAPPING (Correct API Keys)
  // ==============================
  const body = apiData.map((item: any, index: number) => [
    index + 1,
    item.empId ?? '-',
    item.employeeName ?? '-',
    item.designation ?? '-',
    item.locationName ?? '-',
    item.attendanceDate ?? '-',
    item.entryCount ?? 0,
    item.exitCount ?? 0,
    item.totalCount ?? 0,
    item.inCampusDuration ?? '00:00',
    item.outCampusDuration ?? '00:00'
  ]);

  // ==============================
  // 4. AUTO TABLE SETUP
  // ==============================
autoTable(doc, {
  head: head as any,
  body: body,
  startY: 23,
  theme: 'grid',
  tableWidth: 'auto',

  styles: {
    fontSize: 8,
    cellPadding: 2,
    overflow: 'linebreak',
    valign: 'middle',
    halign: 'center',
    lineWidth: 0.1,             // Body cells साठी border width
    lineColor: [200, 200, 200]  // Body cells साठी border color
  },

  headStyles: {
    fillColor: [0, 150, 220],
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    halign: 'center',
    valign: 'middle',
    lineWidth: 0.2,             // Header borders दिसण्यासाठी width वाढवली आहे
    lineColor: [0, 100, 160]    // Header grid lines साठी border color (किंवा पांढऱ्या border साठी [255, 255, 255] वापरा)
  },

  margin: {
    top: 23,
    right: 10,
    bottom: 15,
    left: 10
  },

  showHead: 'firstPage',

  didDrawPage: () => {
    const pageNumber = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(8);
    doc.text(
      `Page ${pageNumber}`,
      pageWidth - 10,
      pageHeight - 5,
      { align: 'right' }
    );
  }
});
  // Download PDF
  doc.save('Entry_Exit_Status_Report.pdf');
}



}

