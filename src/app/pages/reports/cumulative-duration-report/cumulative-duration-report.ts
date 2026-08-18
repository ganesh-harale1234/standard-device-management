import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data-service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-cumulative-duration-report',
 imports: [SharedModule, CommonModule,NgSelectModule],  templateUrl: './cumulative-duration-report.html',
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

  reportData :any[] = [];
 dataSource: any;
  SearchValueSubject = new Subject()
constructor(private dataService:DataService, private toaster:ToastrService){

}

locationID:any;
RoleName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');
  this.getallDataLocation();
  this.roleId = sessionStorage.getItem('rollId')

  // this.SearchValueSubject.subscribe(())

  }

showDropdown: boolean = false;
searchEmpTimer: any;


onLocationChange(event: any) {
  this.selectedLocationName = event.locationName;
}

onSearchEmp(event: any) {
  const trimmed = event.target.value.trim();
  this.searchTextemp = trimmed;

  console.log(this.searchTextemp, "user type input")

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


AttendencesReport() {
  this.reportData = [];
   
  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate   = this.formatDateToYMD(this.toDate);

  let apiUrl: string;
  let requestData: any = { fromDate, toDate };

  // LOCATION 

// All select Fields Send api

if (Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0 && this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
  apiUrl = 'getAttendanceReport';
   requestData.locationIdList = this.selectedLocationIds;
    requestData.employeeId = this.selectedEmployeeId; 
}

  // EMPLOYEE 
  else if (this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
    apiUrl = 'getAttendanceReport';
    requestData.employeeId = this.selectedEmployeeId;
    // requestData.rollId = this.roleId;
  }
  else if(Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0){
    apiUrl = 'getAttendanceReportWithLocationDate';
    requestData.locationIdList = this.selectedLocationIds;
  }

  //  date-based call
  else {
    apiUrl = 'getAttendanceReportWithDate';
  }

  this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {

if(res.code==100){
    this.reportData = res.extend?.attendanceList;
}else if(res.code == 200){
        this.toaster.error(res.msg);
}
    else if (res.code === 500) {
          this.toaster.error(res.msg);
    }else{
      this.toaster.error("Something went wrong !..")
    }
  });
}


selectlocationId: number | null = null;


viewReportDetails() {

  const employeeText = this.searchTextemp || null;

  const employeeId = employeeText
    ? Number(employeeText.match(/\((\d+)\)/)?.[1]) || null
    : null;

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  // Base params - ALL REPORT
  const params: any = {
    fromDate: fromDate,
    toDate: toDate
  };

  // Employee selected असल्यासच employeeId पाठवेल
  if (employeeId) {
    params.employeeId = employeeId;
  }

  console.log('Cumulative Report Request:', params);

  this.dataService.viewattendanceReportDetails(params).subscribe(
    (res: any) => {

      if (res.code === 100) {

        // API response:
        // extend.data
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



@ViewChild('contentToConvert', { static: false })
contentToConvert!: ElementRef;



onExportPdf() {

  const element = this.contentToConvert.nativeElement;

  // Temporary Center Align
  const cells = element.querySelectorAll('td, th');

  cells.forEach((cell: HTMLElement) => {
    cell.style.textAlign = 'center';
    cell.style.verticalAlign = 'middle';
  });

  html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  }).then(canvas => {

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Margin
    const margin = 10;

    // Printable Area
    const printableWidth = pageWidth - (margin * 2);
    const printableHeight = pageHeight - (margin * 2);
    const element = this.contentToConvert.nativeElement;

// PDF साठी खाली space द्या
const oldPadding = element.style.paddingBottom;
element.style.paddingBottom = '50px';

    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // First Page
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= printableHeight;

    // Remaining Pages
    while (heightLeft > 0) {

      position = margin - (imgHeight - heightLeft);

      pdf.addPage();

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= printableHeight;
    }

    pdf.save('Attendance_Report.pdf');

    // Restore Style
    cells.forEach((cell: HTMLElement) => {
      cell.style.textAlign = '';
      cell.style.verticalAlign = '';
    });

  }).catch(err => {
    console.error(err);
  });

}



onExportExcel(): void {

  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No attendance data available for export');
    return;
  }

  const excelData = this.reportData.map((item: any, index: number) => {

    return {
      'Sr No.': index + 1,

      'Employee ID': item.empid ?? '',

      'Employee Name': item.name ?? '',

      'Attendance Date': item.entryDate ?? '',

      'In Time': item.inTime
        ? this.formatExcelDateTime(item.inTime)
        : '',

      'Out Time': item.outTime
        ? this.formatExcelDateTime(item.outTime)
        : '',

      'Total In Stamps': item.totalinstamps ?? '',

      'Total Out Stamps': item.totaloutstamps ?? '',

      'Cumulative Duration': item.cumulativeDuration ?? 0,

      'Total Hours': item.totalhrs ?? '00:00'
    };

  });

  const worksheet: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(excelData);

  // Excel column width
  worksheet['!cols'] = [
    { wch: 10 },  // Sr No
    { wch: 15 },  // Employee ID
    { wch: 25 },  // Employee Name
    { wch: 18 },  // Attendance Date
    { wch: 20 },  // In Time
    { wch: 20 },  // Out Time
    { wch: 25 },  // Total In Stamps
    { wch: 25 },  // Total Out Stamps
    { wch: 22 },  // Cumulative Duration
    { wch: 15 }   // Total Hours
  ];

  const workbook: XLSX.WorkBook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Attendance Report'
  );

  XLSX.writeFile(
    workbook,
    'Cumulative_Duration_Report.xlsx'
  );
}

selectedLocationName = '';

getSelectedLocationName() {
  return this.locationList.find(
    (x: any) => x.locationId === this.selectlocationId
  )?.locationName;
}

formatExcelDateTime(dateValue: string): string {

  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

}


