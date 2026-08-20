
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SharedModule } from '../../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { DataService } from '../../../services/data-service';

@Component({
  selector: 'app-cumulative-duration-report',
  imports: [CommonModule, SharedModule, FormsModule, NgSelectModule],
  templateUrl: './cumulative-duration-report.html',
  styleUrl: './cumulative-duration-report.scss',
})
export class CumulativeDurationReport {

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
constructor(private dataService:DataService, private toaster:ToastrService,private spinner:NgxSpinnerService ){

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

//   // Branch Mandatory
//   if (!this.selectlocationId) {
//     this.toaster.error('Please select Branch');
//     return;
//   }

//   const fromDate = this.formatDateToYMD(this.fromDate);
//   const toDate = this.formatDateToYMD(this.toDate);

//   const requestData = {
//     fromDate,
//     toDate,
//     locationId: this.selectlocationId
//   };

//   this.dataService
//     .addData('auditReport', requestData)
//     .subscribe({
//       next: (res: any) => {

//         if (res.code === 100) {
//           this.reportData = res.extend?.auditReport || [];
//                                           // this.toaster.error(res.msg );

//         } else if(res.code ===200) {
//             this.reportData = [];
//                                 this.toaster.error(res.msg );

//         }else{
//                     this.toaster.error(res.msg || 'Something went wrong!');

//         }

//       },
//       error: (err) => {
//         this.toaster.error(err.error?.msg || 'Server Error');
//       }
//     });

// }



viewReportDetails() {

  const employeeText = this.searchTextemp || null;

  const employeeId = employeeText
    ? Number(employeeText.match(/\((\d+)\)/)?.[1]) || null
    : null;

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  const params: any = {
    fromDate: fromDate,
    toDate: toDate
  };

  if (employeeId) {
    params.employeeId = employeeId;
  }

  console.log('Cumulative Report Request:', params);

  this.dataService.viewAcumulateReportDetails(params).subscribe(
    (res: any) => {

      if (res.code === 100) {

        this.reportData = res.extend?.data || [];

        console.log('Report Details:', this.reportData);

      } else if (res.code === 200) {

        this.reportData = [];
        this.toaster.error(res.msg);

      } else if (res.code === 500) {

        this.reportData = [];
        this.toaster.error(res.msg);

      } else {

        this.reportData = [];
        this.toaster.error('Something went wrong!');

      }
    },

    (error: any) => {

      this.reportData = [];

      this.toaster.error(
        'Server not reachable. Please try again.'
      );

      console.error(
        'Cumulative Report API Error:',
        error
      );
    }
  );
}



onExportExcel(): void {

  // Check data
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No cumulative report data available for export');
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

  // Prepare Excel Data
  const excelData = this.reportData.map((item: any, index: number) => {

    return {
      'Sr No.': index + 1,
      'Employee ID': item.empid ?? '',
      'Employee Name': item.name ?? '',
      'Attendance Date': item.entryDate ?? '',
      'In Time': item.inTime
        ? new Date(item.inTime).toLocaleString('en-GB')
        : '',
      'Out Time': item.outTime
        ? new Date(item.outTime).toLocaleString('en-GB')
        : '',
      'Total In Stamps': item.totalinstamps ?? '',
      'Total Out Stamps': item.totaloutstamps ?? '',
      'Cumulative Duration': item.cumulativeDuration ?? 0,
      'Total Hours': item.totalhrs ?? ''
    };

  });

  // Create worksheet
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
    [],
    [],
    [],
    [],
    Object.keys(excelData[0]),
    ...excelData.map((item: any) => Object.values(item))
  ]);

  // Report Header
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [
        {
          v: 'Cumulative Attendance Report',
          t: 's',
          s: {
            alignment: { horizontal: 'center' },
            font: { bold: true }
          }
        }
      ],

      [
        {
          v: `From Date: ${fDate} to ${tDate}`,
          t: 's',
          s: {
            alignment: { horizontal: 'center' }
          }
        }
      ],

      [
        // `Branch Name: ${branchName}`,
        '',
        '',
        '',
        `Report Time: ${reportTime}`,
        '',
        '',
        '',
        '',
        ''
      ]
    ],
    { origin: 'A1' }
  );

  // Header Styling
  worksheet['A1'].s = {
    alignment: { horizontal: 'center' },
    font: { bold: true }
  };

  worksheet['A2'].s = {
    alignment: { horizontal: 'center' }
  };

  worksheet['A3'].s = {
    alignment: { horizontal: 'center' }
  };

  worksheet['E3'].s = {
    alignment: { horizontal: 'center' }
  };

  // Merge Report Name
  worksheet['!merges'] = [
    // Cumulative Attendance Report
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 9 }
    },

    // From Date
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 9 }
    },

    // Branch Name
    {
      s: { r: 2, c: 0 },
      e: { r: 2, c: 3 }
    },

    // Report Time
    {
      s: { r: 2, c: 4 },
      e: { r: 2, c: 9 }
    }
  ];

  // Column Widths
  worksheet['!cols'] = [
    { wch: 8 },   // Sr No.
    { wch: 15 },  // Employee ID
    { wch: 25 },  // Employee Name
    { wch: 15 },  // Entry Date
    { wch: 22 },  // In Time
    { wch: 22 },  // Out Time
    { wch: 30 },  // Total In Stamps
    { wch: 30 },  // Total Out Stamps
    { wch: 22 },  // Cumulative Duration
    { wch: 15 }   // Total Hours
  ];

  // Create Workbook
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();

  // Add Worksheet
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Cumulative Report'
  );

  // Export Excel
  XLSX.writeFile(
    workbook,
    'Cumulative_Attendance_Report.xlsx'
  );
}
   
  
onExportPdf() {

  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No cumulative report data available for export');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

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

  // =========================
  // Report Header
  // =========================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);

  doc.text(
    'Cumulative Attendance Report',
    pageWidth / 2,
    10,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(
    `From Date: ${fDate} to ${tDate}`,
    pageWidth / 2,
    15,
    { align: 'center' }
  );

  // Branch Name
  doc.setFont('helvetica', 'bold');
  // doc.text('Branch Name: ', 10, 20);

  doc.setFont('helvetica', 'normal');
  // doc.text(branchName, 32, 20);

  // Report Time
  doc.setFont('helvetica', 'bold');
  doc.text('Report Time: ', pageWidth - 70, 20);

  doc.setFont('helvetica', 'normal');
  doc.text(reportTime, pageWidth - 49, 20);


  // =========================
  // Table Header
  // =========================

  const head = [[
    { content: 'Sr No.' },
    { content: 'Employee ID' },
    { content: 'Employee Name' },
    { content: 'Attendance Date' },
    { content: 'In Time' },
    { content: 'Out Time' },
    { content: 'Total In Stamps' },
    { content: 'Total Out Stamps' },
    { content: 'Cumulative Duration' },
    { content: 'Total Hours' }
  ]];


  // =========================
  // Table Body
  // =========================

  const body = this.reportData.map((item: any, index: number) => {

    const inTime = item.inTime
      ? new Date(item.inTime).toLocaleString('en-GB')
      : '-';

    const outTime = item.outTime
      ? new Date(item.outTime).toLocaleString('en-GB')
      : '-';

    return [
      index + 1,
      item.empid ?? '-',
      item.name ?? '-',
      item.entryDate ?? '-',
      inTime,
      outTime,
      item.totalinstamps ?? '-',
      item.totaloutstamps ?? '-',
      item.cumulativeDuration ?? 0,
      item.totalhrs ?? '-'
    ];
  });


  // =========================
  // Generate PDF Table
  // =========================

  autoTable(doc, {
    head: head as any,
    body: body,

    startY: 25,

    theme: 'grid',

    tableWidth: 'auto',

    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'middle',
      halign: 'center',
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },

    headStyles: {
      fillColor: [0, 150, 220],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.2,
      lineColor: [0, 100, 160],
      fontSize: 7
    },

    columnStyles: {
      0: {
        cellWidth: 12
      },
      1: {
        cellWidth: 18
      },
      2: {
        cellWidth: 30
      },
      3: {
        cellWidth: 20
      },
      4: {
        cellWidth: 30
      },
      5: {
        cellWidth: 30
      },
      6: {
        cellWidth: 35
      },
      7: {
        cellWidth: 35
      },
      8: {
        cellWidth: 25
      },
      9: {
        cellWidth: 20
      }
    },

    margin: {
      top: 25,
      right: 8,
      bottom: 15,
      left: 8
    },

    showHead: 'everyPage',

    didDrawPage: () => {

      const pageNumber = doc.getNumberOfPages();
      const pageHeight =
        doc.internal.pageSize.getHeight();

      doc.setFontSize(8);

      doc.text(
        `Page ${pageNumber}`,
        pageWidth - 10,
        pageHeight - 5,
        {
          align: 'right'
        }
      );
    }
  });


  // =========================
  // Save PDF
  // =========================

  doc.save('Cumulative_Attendance_Report.pdf');
}

selectedLocationName = '';
selectlocationId: number | null = null;

getSelectedLocationName(): string {

  if (this.RoleName === 'Branch Admin') {
    return this.locationName || '';
  }

  return this.locationList.find(
    (x: any) => x.locationId === this.selectlocationId
  )?.locationName || '';
}




}
