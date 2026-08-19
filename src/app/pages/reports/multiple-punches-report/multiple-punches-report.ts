import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgSelectModule } from '@ng-select/ng-select';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-multiple-punches-report',
  imports: [SharedModule, CommonModule,NgSelectModule, FormsModule],
  templateUrl: './multiple-punches-report.html',
  styleUrl: './multiple-punches-report.scss',
})
export class MultiplePunchesReport {
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
 data: any[] = [];
 dataSource: any
constructor(private dataService:DataService, private toaster:ToastrService, private spinner:NgxSpinnerService,){

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

// MultiplePunchesReport() {
//      this.reportData = [];
//   const fromDate = this.formatDateToYMD(this.fromDate);
//   const toDate   = this.formatDateToYMD(this.toDate);

//   let apiUrl: string;
//   let requestData: any = { fromDate, toDate };

// // All select Fields Send api

// if (Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0 && this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
//   apiUrl = 'getEmpWiseMultiplePunchReport';
//    requestData.locationIdList = this.selectedLocationIds;
//     requestData. id = this.selectedEmployeeId; 
// }

//   // EMPLOYEE 
//   else if (this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
//     apiUrl = 'getEmpWiseMultiplePunchReport';
//     requestData.id = this.selectedEmployeeId;
//     // requestData.rollId = this.roleId;
//   }
//   else if(Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0){
//     apiUrl = 'getMultiplePunchesLocationDateReport';
//     requestData.locationIdList = this.selectedLocationIds;
//   }

//   //  date-based call
//   else {
//     apiUrl = 'getMultiplePunchesReportWithDate';
//   }

//   this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {

// if(res.code==100){
//     this.reportData = res.extend?.punchList;
// }else if(res.code == 200){
//         this.toaster.error(res.msg);
//           this.reportData = [];
// }
//     else if (res.code === 500) {
//           this.toaster.error(res.msg);
//     }else{
//       this.toaster.error("Something went wrong !..")
//     }
//   });;
// }


MultiplePunchesReport() {
  this.reportData = [];

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  let apiUrl: string;
  let requestData: any = { fromDate, toDate };

  // All select Fields Send api
  if (
    Array.isArray(this.selectedLocationIds) &&
    this.selectedLocationIds.length > 0 &&
    this.selectedEmployeeId != null &&
    this.selectedEmployeeId !== ''
  ) {
    apiUrl = 'getEmpWiseMultiplePunchReport';
    requestData.locationIdList = this.selectedLocationIds;
    requestData.id = this.selectedEmployeeId;
  }

  // EMPLOYEE
  else if (
    this.selectedEmployeeId != null &&
    this.selectedEmployeeId !== ''
  ) {
    apiUrl = 'getEmpWiseMultiplePunchReport';
    requestData.id = this.selectedEmployeeId;
    // requestData.rollId = this.roleId;
  }

  else if (
    Array.isArray(this.selectedLocationIds) &&
    this.selectedLocationIds.length > 0
  ) {
    apiUrl = 'getMultiplePunchesLocationDateReport';
    requestData.locationIdList = this.selectedLocationIds;
  }

  // date-based call
  else {
    apiUrl = 'getMultiplePunchesReportWithDate';
  }

  this.spinner.show();

  this.dataService.addData(apiUrl, requestData).subscribe(
    (res: any) => {

      this.spinner.hide();

      if (res.code == 100) {
        this.reportData = res.extend?.punchList;
            this.spinner.hide();
      }
      else if (res.code == 200) {
        this.toaster.error(res.msg);
            this.spinner.hide();
        this.reportData = [];
      }
      else if (res.code === 500) {
        this.toaster.error(res.msg);
            this.spinner.hide();
      }
      else {
        this.toaster.error("Something went wrong !..");
      }
    },
    (error: any) => {

      this.spinner.hide();

      console.error('Multiple Punches Report API Error:', error);

      this.toaster.error(
        'Unable to fetch multiple punches report. Please try again later.'
      );

      this.reportData = [];
    }
  );
}


convertTime(time: string): Date | null {
  if (!time) return null;

  const today = new Date().toISOString().split('T')[0];
  return new Date(`${today}T${time}`);
}

selectlocationId: number | null = null;
  viewReportDetails() {
  if (this.RoleName !== 'Branch Admin' && this.selectlocationId == null) {
  this.toaster.error('Please select a Branch');
  return;
}
    const employeeText = this.searchTextemp || null;
    const employeeId = employeeText? Number(employeeText.match(/\((\d+)\)/)?.[1]) || null : null;
    const fromDate = this.formatDateToYMD(this.fromDate);
    const toDate = this.formatDateToYMD(this.toDate);

const locationId =
  this.RoleName === 'Branch Admin'
    ? this.locationID
    : this.selectlocationId;

    const requestData = {
      id: employeeId || null,
      fromDate: fromDate,
      toDate: toDate,
      locationIdList: locationId ? [locationId] : []
    };

    this.dataService.viewmultiplePunchesReportDetails(requestData).subscribe((res: any) => {
      if (res.code === 100) {
        this.reportData = res.extend?.punchList;
        console.log('Report Details:', this.reportData);
      } else if (res.code === 200) {
        this.reportData = [];
        this.toaster.error(res.msg);
      } else if (res.code === 500) {
        this.toaster.error(res.msg);
      } else {
        this.toaster.error("Something went wrong!");
      }
    });

  }
   
  


onExportPdf() {
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No multiple punches data available to export');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const branchName = this.getSelectedLocationName() || 'All';
  const fromDateValue = this.fromDate ? this.formatDateToYMD(this.fromDate) : null;
  const toDateValue = this.toDate ? this.formatDateToYMD(this.toDate) : null;
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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Multiple Punches Report', pageWidth / 2, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`From Date: ${fDate} to ${tDate}`, pageWidth / 2, 15, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text('Branch Name: ', 10, 20);
  doc.setFont('helvetica', 'normal');
  doc.text(branchName, 32, 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Report Time: ', pageWidth - 70, 20);
  doc.setFont('helvetica', 'normal');
  doc.text(reportTime, pageWidth - 49, 20);

  const head = [[
    { content: 'Sr No.' },
    { content: 'Employee Id' },
    { content: 'Employee Name' },
    { content: 'Attendance Date' },
    { content: 'Punches' }
  ]];

  const body = this.reportData.map((item: any, index: number) => [
    index + 1,
    item.enrollId ?? '-',
    item.employeeName ?? '-',
    item.attendanceDate ?? '-',
    item.ioStatus ? this.formatIoStatus(item.ioStatus) : '-'
  ]);

  autoTable(doc, {
    head: head as any,
    body: body,
    startY: 25,
    theme: 'grid',
    tableWidth: 'auto',
    styles: {
      fontSize: 8,
      cellPadding: 2,
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
      lineColor: [0, 100, 160]
    },
    margin: {
      top: 25,
      right: 10,
      bottom: 15,
      left: 10
    },
    showHead: 'firstPage',
    didDrawPage: () => {
      const pageNumber = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.text(`Page ${pageNumber}`, pageWidth - 10, pageHeight - 5, { align: 'right' });
    }
  });

  doc.save('Multiple_Punches_Report.pdf');
}



onExportExcel(): void {

  // Check data
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No attendance data available for export');
    return;
  }

  const branchName = this.getSelectedLocationName() || 'All';
  const fromDateValue = this.fromDate ? this.formatDateToYMD(this.fromDate) : null;
  const toDateValue = this.toDate ? this.formatDateToYMD(this.toDate) : null;
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

  // Prepare Excel data
  const excelData = this.reportData.map((item: any, index: number) => {

    return {
      'Sr No.': index + 1,
      'Employee ID': item.enrollId ?? '',
      'Employee Name': item.employeeName ?? '',
      'Attendance Date': item.attendanceDate ?? '',
      'Punches': item.ioStatus ?? ''
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

  XLSX.utils.sheet_add_aoa(worksheet, [
    [{ v: 'Multiple Punches Report', t: 's', s: { alignment: { horizontal: 'center' }, font: { bold: true } } }],
    [{ v: `From Date: ${fDate} to ${tDate}`, t: 's', s: { alignment: { horizontal: 'center' } } }],
    [`Branch Name: ${branchName}`, '', '', '', `Report Time: ${reportTime}`]
  ], { origin: 'A1' });

  worksheet['A1'].s = { alignment: { horizontal: 'center' }, font: { bold: true } };
  worksheet['A2'].s = { alignment: { horizontal: 'center' } };
  worksheet['A3'].s = { alignment: { horizontal: 'center' } };
  worksheet['E3'].s = { alignment: { horizontal: 'center' } };

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } }
  ];

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 },  // Sr No.
    { wch: 15 },  // Employee ID
    { wch: 25 },  // Employee Name
    { wch: 20 },  // Attendance Date
    { wch: 20 }   // IN / OUT Status
  ];

  // Create workbook
  const workbook: XLSX.WorkBook =
    XLSX.utils.book_new();

  // Add worksheet
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Punch Report'
  );

  // Generate and download Excel
  XLSX.writeFile(
    workbook,
    'Multiple_Punches_Report.xlsx'
  );
}

formatIoStatus(status: string): string {
  if (!status) return '';

  return status.replace(/(\d{2}:\d{2}):\d{2}/g, '$1');
}

selectedLocationName = '';

getSelectedLocationName() {

  if (this.RoleName === 'Branch Admin') {
    return this.locationName || '';
  }

  return this.locationList.find(
    (x: any) => x.locationId === this.selectlocationId
  )?.locationName || '';
}

}

