import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data-service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-attendance-report',
  imports: [SharedModule, CommonModule,NgSelectModule],
  templateUrl: './attendance-report.html',
  styleUrl: './attendance-report.scss',
})
export class AttendanceReport {
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


// AttendencesReport() {
//   this.reportData = [];
   
//   const fromDate = this.formatDateToYMD(this.fromDate);
//   const toDate   = this.formatDateToYMD(this.toDate);

//   let apiUrl: string;
//   let requestData: any = { fromDate, toDate };

//   // LOCATION 

// // All select Fields Send api

// if (Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0 && this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
//   apiUrl = 'getAttendanceReport';
//    requestData.locationIdList = this.selectedLocationIds;
//     requestData.employeeId = this.selectedEmployeeId; 
// }

//   // EMPLOYEE 
//   else if (this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
//     apiUrl = 'getAttendanceReport';
//     requestData.employeeId = this.selectedEmployeeId;
//     // requestData.rollId = this.roleId;
//   }
//   else if(Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0){
//     apiUrl = 'getAttendanceReportWithLocationDate';
//     requestData.locationIdList = this.selectedLocationIds;
//   }

//   //  date-based call
//   else {
//     apiUrl = 'getAttendanceReportWithDate';
//   }

//   this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {

// if(res.code==100){
//     this.reportData = res.extend?.attendanceList;
// }else if(res.code == 200){
//         this.toaster.error(res.msg);
// }
//     else if (res.code === 500) {
//           this.toaster.error(res.msg);
//     }else{
//       this.toaster.error("Something went wrong !..")
//     }
//   });
// }
// Branch Admin


AttendencesReport() {
  this.reportData = [];

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  let apiUrl: string;
  let requestData: any = { fromDate, toDate };

  // LOCATION

  // All select Fields Send api
  if (
    Array.isArray(this.selectedLocationIds) &&
    this.selectedLocationIds.length > 0 &&
    this.selectedEmployeeId != null &&
    this.selectedEmployeeId !== ''
  ) {
    apiUrl = 'getAttendanceReport';
    requestData.locationIdList = this.selectedLocationIds;
    requestData.employeeId = this.selectedEmployeeId;
  }

  // EMPLOYEE
  else if (
    this.selectedEmployeeId != null &&
    this.selectedEmployeeId !== ''
  ) {
    apiUrl = 'getAttendanceReport';
    requestData.employeeId = this.selectedEmployeeId;
    // requestData.rollId = this.roleId;
  }

  else if (
    Array.isArray(this.selectedLocationIds) &&
    this.selectedLocationIds.length > 0
  ) {
    apiUrl = 'getAttendanceReportWithLocationDate';
    requestData.locationIdList = this.selectedLocationIds;
  }

  // date-based call
  else {
    apiUrl = 'getAttendanceReportWithDate';
  }

  this.spinner.show();

  this.dataService.addData(apiUrl, requestData).subscribe(
    (res: any) => {

      this.spinner.hide();

      if (res.code == 100) {
        this.reportData = res.extend?.attendanceList;
            this.spinner.hide();
      }
      else if (res.code == 200) {
        this.toaster.error(res.msg);
            this.spinner.hide();
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

      console.error('Attendance Report API Error:', error);

      this.toaster.error(
        'Unable to fetch attendance report. Please try again later.'
      );
    }
  );
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
  employeeId: employeeId || null,
  fromDate: fromDate,
  toDate: toDate,
  locationId: locationId ? [locationId] : []
};

    this.dataService.viewattendanceReportDetails(requestData).subscribe((res: any) => {
      if (res.code === 100) {
        this.reportData = res.extend?.attendanceList;
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



@ViewChild('contentToConvert', { static: false })
contentToConvert!: ElementRef;



onExportPdf() {

  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No attendance data available to export');
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
  doc.text('Attendance Report', pageWidth / 2, 10, { align: 'center' });

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
    { content: 'Sr No.', rowSpan: 2 },
    { content: 'Employee Id', rowSpan: 2 },
    { content: 'Employee Name', rowSpan: 2 },
    { content: 'Attendance Date', rowSpan: 2 },
    { content: 'Punch In', rowSpan: 2 },
    { content: 'Punch Out', rowSpan: 2 }
  ]];

  const body = this.reportData.map((item: any, index: number) => [
    index + 1,
    item.employeeId ?? '-',
    item.employeeName ?? '-',
    item.attendanceDate ? new Date(item.attendanceDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : '-',
    item.punchIn ? item.punchIn.slice(0, 5) : '-',
    item.punchOut ? item.punchOut.slice(0, 5) : '-'
  ]);

autoTable(doc, {

  head: [[
    { content: 'Sr No.' },
    { content: 'Employee Id' },
    { content: 'Employee Name' },
    { content: 'Attendance Date' },
    { content: 'Punch In' },
    { content: 'Punch Out' }
  ]],

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

  // IMPORTANT
  showHead: 'firstPage',

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

  doc.save('Attendance_Report.pdf');
}



onExportExcel(): void {

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

  const excelData = this.reportData.map((item: any, index: number) => {

    return {
      'Sr No.': index + 1,
      'Employee ID': item.employeeId ?? '',
      'Employee Name': item.employeeName ?? '',
      'Attendance Date': item.attendanceDate ?? '',
      'Punch In': item.punchIn ?? '',
      'Punch Out': item.punchOut ?? '',
    };

  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
    [],
    [],
    [],
    [],
    Object.keys(excelData[0]),
    ...excelData.map((item: any) => Object.values(item))
  ]);

  XLSX.utils.sheet_add_aoa(worksheet, [
    [{ v: 'Attendance Report', t: 's', s: { alignment: { horizontal: 'center' }, font: { bold: true } } }],
    [{ v: `From Date: ${fDate} to ${tDate}`, t: 's', s: { alignment: { horizontal: 'center' } } }],
    [`Branch Name: ${branchName}`, '', '', '', `Report Time: ${reportTime}`, '']
  ], { origin: 'A1' });

  worksheet['A1'].s = { alignment: { horizontal: 'center' }, font: { bold: true } };
  worksheet['A2'].s = { alignment: { horizontal: 'center' } };
  worksheet['A3'].s = { alignment: { horizontal: 'center' } };
  worksheet['E3'].s = { alignment: { horizontal: 'center' } };

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } }
  ];

  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 }
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
    'Attendance_Report.xlsx'
  );
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
