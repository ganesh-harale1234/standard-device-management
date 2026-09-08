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
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


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
  
    maxDate: string = new Date().toISOString().split('T')[0];
fromDateValue: string = new Date().toISOString().split('T')[0];
toDateValue: string = new Date().toISOString().split('T')[0];

reportData:any[] = [];
 data: any[] = [];
 dataSource: any
constructor(private dataService:DataService, private toaster:ToastrService, private spinner:NgxSpinnerService,){

}

locationID:any;
RoleName:any;
locationName:any;
  ngOnInit(): void {
    this.getallData()
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

  const branchId = this.RoleName === 'Branch Admin'
    ? this.locationID
    : this.selectlocationId;

  if (!trimmed) {
    this.employeeList = [];
    this.searchDone = false;
    this.showDropdown = false;   
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

  this.isEmpLoading = true;
  this.searchDone = false;
  this.showDropdown = true;   
  this.employeeList = [];
  this.selectedEmployeeId = null;

  this.dataService.getAllData(`searchByNameOrId/${trimmed}?locationId=${branchId}`).subscribe(
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









getAllList:any[] = []
selectedCategoryIds: string[] = [];

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





formatDateToYMD(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();

  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

formatExportDate(date: Date | null): string {
  if (!date) return 'N/A';

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
}

formatExportDateTime(date: Date): string {
  const hour = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, '0');
  const amPm = date.getHours() >= 12 ? 'PM' : 'AM';

  return `${this.formatExportDate(date)} , ${hour}:${minute} ${amPm}`;
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

if (!this.selectedCategoryIds || this.selectedCategoryIds.length === 0) {
  this.toaster.error('Please select one category...!');
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
      locationIdList: locationId ? [locationId] : [],
      categoryIdList: this.selectedCategoryIds,
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
   
getPunches(ioStatus: string): string[] {
  if (!ioStatus) {
    return [];
  }

  return ioStatus
    .split(',')
    .map((punch: string) => punch.trim());
}


// Location List
locationLists: any[] = [ ]
// Selected IDs

getLocationId(){
  this.getworkingHoursTime()
}



// formatTime(time: string): string {
//   if (!time) {
//     return '';
//   }

//   return time.slice(0, 5);
// }

formatTime(time: string): string {
  if (!time) {
    return '';
  }

  const cleanTime = time.trim().replace(/\s*(AM|PM)$/i, '');
  const [hours, minutes] = cleanTime.split(':');

  const hour = Number(hours);
  const period = hour >= 12 ? 'PM' : 'AM';

  return `${hours}:${minutes} ${period}`;
}
// getworkingHoursTime() {

//   this.dataService.getAllData(`findWorkingHoursBranch?locationId=${this.selectlocationId}`).subscribe(
//     (res: any) => {
//       if (res.code === 100) {
//         this.workingHoursSetTime = res.extend.workingHours;
//       }
      
    
//       else if (res.code === 200) {
//         this.toaster.error(res.extend.msg);
//       } else {
//         this.toaster.error('Something went wrong!');
//       }
//     },
//     (err) => {
//       // this.toaster.error(err.error.msg || 'Failed to load location list!');
//     }
//   );
// }

workingHoursSetTime: any = null;

getworkingHoursTime() {
  this.dataService
    .getAllData(`findWorkingHoursBranch?locationId=${this.selectlocationId}`)
    .subscribe(
      (res: any) => {

        if (res.code === 100) {

          this.workingHoursSetTime = res.extend?.workingHours || null;

        } else if (res.code === 200) {

          // Clear previous working hours
          this.workingHoursSetTime = null;

          this.toaster.error(
            res.extend?.msg || 'Working hours not found!'
          );

        } else {

          this.workingHoursSetTime = null;
          this.toaster.error('Something went wrong!');

        }
      },
      (err) => {

        this.workingHoursSetTime = null;

        this.toaster.error(
          err?.error?.msg || 'Failed to load working hours!'
        );
      }
    );
}


isLateEarlyPunch(punch: string, lateEarly: string): boolean {

  if (!punch || !lateEarly) {
    return false;
  }

  // Punch मधून time काढा
  // Example: 10:25-IN -> 10:25
  const punchMatch = punch.match(/^(\d{2}:\d{2})-(IN|OUT)$/);

  if (!punchMatch) {
    return false;
  }

  const punchTime = punchMatch[1];

  // LateComing time
  const lateComingMatch = lateEarly.match(
    /LateComing-(\d{2}:\d{2})/
  );

  if (
    lateComingMatch &&
    lateComingMatch[1] === punchTime
  ) {
    return true;
  }

  // EarlyGoing time
  const earlyGoingMatch = lateEarly.match(
    /EarlyGoing-(\d{2}:\d{2})/
  );

  if (
    earlyGoingMatch &&
    earlyGoingMatch[1] === punchTime
  ) {
    return true;
  }

  return false;
}

isContinuousDuplicatePunch(punch: string, ioStatus: string): boolean {
  if (!punch || !ioStatus) {
    return false;
  }

  const punchMatch = punch.match(/^(\d{2}:\d{2})-(IN|OUT)$/);

  if (!punchMatch) {
    return false;
  }

  const punchTime = punchMatch[1];
  const punchType = punchMatch[2];

  const punches = ioStatus
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean);

  const currentIndex = punches.findIndex((item: string) => item === punch);

  if (currentIndex === -1) {
    return false;
  }

  const prevMatch = punches[currentIndex - 1]?.match(/^(\d{2}:\d{2})-(IN|OUT)$/);
  const nextMatch = punches[currentIndex + 1]?.match(/^(\d{2}:\d{2})-(IN|OUT)$/);

  const sameAsPrev = !!prevMatch && prevMatch[2] === punchType;
  const sameAsNext = !!nextMatch && nextMatch[2] === punchType;

  return sameAsPrev || sameAsNext;
}

// onExportPdf() {
//   if (!this.reportData || this.reportData.length === 0) {
//     this.toaster.error('No multiple punches data available to export');
//     return;
//   }

//   const doc = new jsPDF('l', 'mm', 'a4');
//   const pageWidth = doc.internal.pageSize.getWidth();

//   const branchName = this.getSelectedLocationName() || 'All';
//   const fDate = this.formatExportDate(this.fromDate);
//   const tDate = this.formatExportDate(this.toDate);
//   const reportTime = this.formatExportDateTime(new Date());
//   const startWorkingTime = this.formatTime(this.workingHoursSetTime?.inTime) || 'N/A';
//   const endWorkingTime = this.formatTime(this.workingHoursSetTime?.outTime) || 'N/A';

//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(14);
//   doc.text('Multiple Punches Report', pageWidth / 2, 10, { align: 'center' });

//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(9);
//   doc.text(`From Date: ${fDate} to ${tDate}`, pageWidth / 2, 15, { align: 'center' });

//   doc.setFont('helvetica', 'bold');
//   doc.text('Branch Name: ', 10, 20);
//   doc.setFont('helvetica', 'normal');
//   doc.text(branchName, 32, 20);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Report Time: ', pageWidth - 70, 20);
//   doc.setFont('helvetica', 'normal');
//   doc.text(reportTime, pageWidth - 49, 20);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Start Working Time : ', 10, 25);
//   doc.setFont('helvetica', 'normal');
//   doc.text(startWorkingTime, 43, 25);
//   doc.setFont('helvetica', 'bold');
//   doc.text('End Working Time : ', pageWidth - 70, 25);
//   doc.setFont('helvetica', 'normal');
//   doc.text(endWorkingTime, pageWidth - 39, 25);

//   const head = [[
//     { content: 'Sr No.' },
//     { content: 'Employee Id' },
//     { content: 'Employee Name' },
//     { content: 'Category' },
//     { content: 'Department' },
//     { content: 'Designation' },
//     { content: 'Attendance Date' },
//     { content: 'Punches' }
//   ]];

//   const body = this.reportData.map((item: any, index: number) => [
//     index + 1,
//     item.enrollId ?? '-',
//     item.employeeName ?? '-',
//     item.category ?? '-',
//     item.department ?? '-',
//     item.designation ?? '-',
//     item.attendanceDate ?? '-',
//     item.ioStatus ? this.formatIoStatus(item.ioStatus) : '-'
//   ]);

//   autoTable(doc, {
//     head: head as any,
//     body: body,
//     startY: 30,
//     theme: 'grid',
//     tableWidth: 'auto',
//     styles: {
//       fontSize: 8,
//       cellPadding: 2,
//       overflow: 'linebreak',
//       valign: 'middle',
//       halign: 'center',
//       lineWidth: 0.1,
//       lineColor: [200, 200, 200]
//     },
//     headStyles: {
//       fillColor: [0, 150, 220],
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       halign: 'center',
//       valign: 'middle',
//       lineWidth: 0.2,
//       lineColor: [0, 100, 160]
//     },
//     margin: {
//       top: 30,
//       right: 10,
//       bottom: 15,
//       left: 10
//     },
//     showHead: 'firstPage',
//     didDrawPage: () => {
//       const pageNumber = doc.getNumberOfPages();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.setFontSize(8);
//       doc.text(`Page ${pageNumber}`, pageWidth - 10, pageHeight - 5, { align: 'right' });
//     }
//   });

//   doc.save('Multiple_Punches_Report.pdf');
// }


// onExportPdf() {

//   if (!this.reportData || this.reportData.length === 0) {
//     this.toaster.error('No multiple punches data available to export');
//     return;
//   }

//   // =====================================================
//   // CREATE PDF
//   // =====================================================

//   const doc = new jsPDF('l', 'mm', 'a4');

//   const pageWidth =
//     doc.internal.pageSize.getWidth();

//   // =====================================================
//   // REPORT DETAILS
//   // =====================================================

//   const branchName =
//     this.getSelectedLocationName() || 'All';

//   const fDate =
//     this.formatExportDate(this.fromDate);

//   const tDate =
//     this.formatExportDate(this.toDate);

//   const reportTime =
//     this.formatExportDateTime(new Date());

//   const startWorkingTime =
//     this.formatTime(
//       this.workingHoursSetTime?.inTime
//     ) || 'N/A';

//   const endWorkingTime =
//     this.formatTime(
//       this.workingHoursSetTime?.outTime
//     ) || 'N/A';


//   // =====================================================
//   // TITLE
//   // =====================================================

//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(14);
//   doc.setTextColor(0, 0, 0);

//   doc.text(
//     'Multiple Punches Report',
//     pageWidth / 2,
//     10,
//     {
//       align: 'center'
//     }
//   );


//   // =====================================================
//   // DATE
//   // =====================================================

//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(9);

//   doc.text(
//     `From Date: ${fDate} to ${tDate}`,
//     pageWidth / 2,
//     15,
//     {
//       align: 'center'
//     }
//   );


//   // =====================================================
//   // BRANCH NAME
//   // =====================================================

//   doc.setFont('helvetica', 'bold');

//   doc.text(
//     'Branch Name: ',
//     10,
//     20
//   );

//   doc.setFont('helvetica', 'normal');

//   doc.text(
//     branchName,
//     32,
//     20
//   );


//   // =====================================================
//   // REPORT TIME
//   // =====================================================

//   doc.setFont('helvetica', 'bold');

//   doc.text(
//     'Report Time: ',
//     pageWidth - 70,
//     20
//   );

//   doc.setFont('helvetica', 'normal');

//   doc.text(
//     reportTime,
//     pageWidth - 49,
//     20
//   );


//   // =====================================================
//   // START WORKING TIME
//   // =====================================================


// doc.setFont('helvetica', 'bold');

// doc.text(
//   'Start Working Time :',
//   10,
//   25
// );

// doc.setFont('helvetica', 'normal');

// doc.text(
//   startWorkingTime,
//   42,
//   25
// );


// // =====================================================
// // END WORKING TIME
// // =====================================================

// doc.setFont('helvetica', 'bold');

// doc.text(
//   'End Working Time :',
//   60,
//   25
// );

// doc.setFont('helvetica', 'normal');

// doc.text(
//   endWorkingTime,
//   91,
//   25
// );

//   // =====================================================
//   // TABLE HEADER
//   // =====================================================

//   const head = [[

//     'Sr No.',

//     'Employee Id',

//     'Employee Name',

//     'Category',

//     'Department',

//     'Designation',

//     'Attendance Date',

//     'Punches'

//   ]];


//   // =====================================================
//   // TABLE BODY
//   // =====================================================

//   const body =
//     this.reportData.map(
//       (item: any, index: number) => [

//         index + 1,

//         item.enrollId ?? '-',

//         item.employeeName ?? '-',

//         item.category ?? '-',

//         item.department ?? '-',

//         item.designation ?? '-',

//         item.attendanceDate ?? '-',

//         ''

//       ]
//     );


//   // =====================================================
//   // TABLE
//   // =====================================================

//   autoTable(doc, {

//     head: head as any,

//     body: body,

//     startY: 30,

//     theme: 'grid',

//     tableWidth: 'auto',


//     // ===================================================
//     // GENERAL STYLE
//     // ===================================================

//     styles: {

//       font: 'helvetica',

//       fontSize: 8,

//       cellPadding: 2,

//       overflow: 'linebreak',

//       valign: 'middle',

//       halign: 'center',

//       lineWidth: 0.1,

//       lineColor: [
//         200,
//         200,
//         200
//       ]

//     },


//     // ===================================================
//     // HEADER STYLE
//     // ===================================================

//     headStyles: {

//       fillColor: [
//         0,
//         150,
//         220
//       ],

//       textColor: [
//         255,
//         255,
//         255
//       ],

//       fontStyle: 'bold',

//       halign: 'center',

//       valign: 'middle',

//       lineWidth: 0.2,

//       lineColor: [
//         0,
//         100,
//         160
//       ]

//     },


//     // ===================================================
//     // COLUMN WIDTH
//     // ===================================================

//     columnStyles: {

//       // Sr No
//       0: {
//         cellWidth: 14,
//         halign: 'center'
//       },

//       // Employee Id
//       1: {
//         cellWidth: 24,
//         halign: 'center'
//       },

//       // Employee Name
//       2: {
//         cellWidth: 42,
//         halign: 'left'
//       },

//       // Category
//       3: {
//         cellWidth: 32,
//         halign: 'left'
//       },

//       // Department
//       4: {
//         cellWidth: 38,
//         halign: 'left'
//       },

//       // Designation
//       5: {
//         cellWidth: 38,
//         halign: 'left'
//       },

//       // Attendance Date
//       6: {
//         cellWidth: 32,
//         halign: 'center'
//       },

//       // Punches
//       7: {
//         cellWidth: 'auto',
//         halign: 'left'
//       }

//     },


//     margin: {

//       top: 30,

//       right: 8,

//       bottom: 15,

//       left: 8

//     },


//     showHead: 'firstPage',


//     // =====================================================
//     // IMPORTANT
//     // CALCULATE ROW HEIGHT BEFORE DRAWING
//     // =====================================================

//     didParseCell: (data: any) => {

//       if (
//         data.column.index !== 7 ||
//         data.cell.section !== 'body'
//       ) {
//         return;
//       }


//       const rowIndex =
//         data.row.index;

//       const row =
//         this.reportData[rowIndex];


//       if (!row) {
//         return;
//       }


//       const punches =
//         this.getPunches(
//           row?.ioStatus
//         );


//       if (
//         !punches ||
//         punches.length === 0
//       ) {
//         return;
//       }


//       // -------------------------------------------------
//       // Calculate available punch width
//       // -------------------------------------------------

//       const availableWidth =
//         68;


//       const commaWidth =
//         doc.getTextWidth(', ');


//       const lines: string[][] = [];

//       let currentLine: string[] = [];

//       let currentWidth = 0;


//       // =================================================
//       // CREATE LINES
//       // =================================================

//       punches.forEach(
//         (punch: string) => {

//           const punchWidth =
//             doc.getTextWidth(
//               punch
//             );


//           const extraWidth =
//             currentLine.length > 0
//               ? commaWidth
//               : 0;


//           // ---------------------------------------------
//           // Check if punch fits
//           // ---------------------------------------------

//           if (
//             currentLine.length > 0 &&
//             currentWidth +
//             extraWidth +
//             punchWidth >
//             availableWidth
//           ) {

//             // Save current line
//             lines.push(
//               currentLine
//             );


//             // New line
//             currentLine = [
//               punch
//             ];

//             currentWidth =
//               punchWidth;

//           } else {

//             currentLine.push(
//               punch
//             );

//             currentWidth +=
//               extraWidth +
//               punchWidth;

//           }

//         }
//       );


//       // -------------------------------------------------
//       // Last line
//       // -------------------------------------------------

//       if (
//         currentLine.length > 0
//       ) {

//         lines.push(
//           currentLine
//         );

//       }


//       // =================================================
//       // AUTOMATIC ROW HEIGHT
//       // =================================================

//       const lineHeight = 4.5;

//       const requiredHeight =
//         (lines.length * lineHeight) + 4;


//       data.cell.styles.minCellHeight =
//         Math.max(
//           8,
//           requiredHeight
//         );

//     },


//     // =====================================================
//     // DRAW PUNCHES
//     // =====================================================

//     didDrawCell: (data: any) => {

//       // Only Punches column
//       if (
//         data.column.index !== 7 ||
//         data.cell.section !== 'body'
//       ) {
//         return;
//       }


//       const rowIndex =
//         data.row.index;

//       const row =
//         this.reportData[rowIndex];


//       if (!row) {
//         return;
//       }


//       const punches =
//         this.getPunches(
//           row?.ioStatus
//         );


//       if (
//         !punches ||
//         punches.length === 0
//       ) {
//         return;
//       }


//       // =================================================
//       // ACTUAL CELL WIDTH
//       // =================================================

//       const cell =
//         data.cell;

//       const padding = 2;

//       const availableWidth =
//         cell.width -
//         (padding * 2);


//       const lineHeight = 4.5;


//       // =================================================
//       // CREATE WRAPPED LINES
//       // =================================================

//       const lines: string[][] = [];

//       let currentLine: string[] = [];

//       let currentWidth = 0;


//       punches.forEach(
//         (punch: string) => {

//           const punchWidth =
//             doc.getTextWidth(
//               punch
//             );


//           const commaWidth =
//             doc.getTextWidth(', ');


//           const requiredWidth =
//             currentLine.length === 0
//               ? punchWidth
//               : commaWidth +
//                 punchWidth;


//           // ---------------------------------------------
//           // If doesn't fit -> new line
//           // ---------------------------------------------

//           if (
//             currentLine.length > 0 &&
//             currentWidth +
//             requiredWidth >
//             availableWidth
//           ) {

//             lines.push(
//               currentLine
//             );


//             currentLine = [
//               punch
//             ];


//             currentWidth =
//               punchWidth;

//           } else {

//             currentLine.push(
//               punch
//             );


//             currentWidth +=
//               requiredWidth;

//           }

//         }
//       );


//       // Last line
//       if (
//         currentLine.length > 0
//       ) {

//         lines.push(
//           currentLine
//         );

//       }


//       // =================================================
//       // CALCULATE START Y
//       // =================================================

//       const totalHeight =
//         lines.length *
//         lineHeight;


//       let y =
//         cell.y +
//         (
//           cell.height -
//           totalHeight
//         ) / 2 +
//         3;


//       // =================================================
//       // DRAW EACH LINE
//       // =================================================

//       lines.forEach(
//         (line: string[]) => {

//           let x =
//             cell.x +
//             padding;


//           line.forEach(
//             (
//               punch: string,
//               index: number
//             ) => {


//               // -----------------------------------------
//               // SAME HTML CONDITION
//               // -----------------------------------------

//               const isContinuousDuplicate =
//                 this.isContinuousDuplicatePunch(
//                   punch,
//                   row?.ioStatus
//                 );

//               const isLateEarly =
//                 this.isLateEarlyPunch(
//                   punch,
//                   row?.lateEarly
//                 );


//               // -----------------------------------------
//               // TEXT COLOR
//               // -----------------------------------------

//               if (isContinuousDuplicate) {

//                 // YELLOW
//                 doc.setTextColor(
//                   234,
//                   179,
//                   8
//                 );

//               } else if (isLateEarly) {

//                 // RED
//                 doc.setTextColor(
//                   220,
//                   38,
//                   38
//                 );

//               } else {

//                 // BLACK
//                 doc.setTextColor(
//                   0,
//                   0,
//                   0
//                 );

//               }


//               // -----------------------------------------
//               // DRAW PUNCH
//               // -----------------------------------------

//               doc.text(
//                 punch,
//                 x,
//                 y
//               );


//               // Move X
//               x +=
//                 doc.getTextWidth(
//                   punch
//                 );


//               // -----------------------------------------
//               // COMMA
//               // -----------------------------------------

//               if (
//                 index <
//                 line.length - 1
//               ) {

//                 doc.setTextColor(
//                   0,
//                   0,
//                   0
//                 );


//                 doc.text(
//                   ',',
//                   x + 1,
//                   y
//                 );


//                 x += 4;

//               }

//             }
//           );


//           // Next line
//           y +=
//             lineHeight;

//         }
//       );


//       // =================================================
//       // RESET COLOR
//       // =================================================

//       doc.setTextColor(
//         0,
//         0,
//         0
//       );

//     },


//     // =====================================================
//     // PAGE NUMBER
//     // =====================================================

//     didDrawPage: () => {

//       const pageNumber =
//         doc.getNumberOfPages();

//       const currentPageHeight =
//         doc.internal.pageSize.getHeight();


//       doc.setFont(
//         'helvetica',
//         'normal'
//       );

//       doc.setFontSize(8);

//       doc.setTextColor(
//         0,
//         0,
//         0
//       );


//       doc.text(
//         `Page ${pageNumber}`,
//         pageWidth - 10,
//         currentPageHeight - 5,
//         {
//           align: 'right'
//         }
//       );

//     }

//   });


//   // =====================================================
//   // SAVE PDF
//   // =====================================================

//   doc.save(
//     'Multiple_Punches_Report.pdf'
//   );

// }


onExportPdf() {

  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No multiple punches data available to export');
    return;
  }

  // =====================================================
  // CREATE PDF
  // =====================================================

  const doc = new jsPDF('l', 'mm', 'a4');

  const pageWidth =
    doc.internal.pageSize.getWidth();


  // =====================================================
  // REPORT DETAILS
  // =====================================================

  const branchName =
    this.getSelectedLocationName() || 'All';

  const fDate =
    this.formatExportDate(this.fromDate);

  const tDate =
    this.formatExportDate(this.toDate);

  const reportTime =
    this.formatExportDateTime(new Date());

  // =====================================================
  // TITLE
  // =====================================================

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);

  doc.text(
    'Multiple Punches Report',
    pageWidth / 2,
    10,
    {
      align: 'center'
    }
  );


  // =====================================================
  // DATE
  // =====================================================

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(
    `From Date: ${fDate} to ${tDate}`,
    pageWidth / 2,
    15,
    {
      align: 'center'
    }
  );


  // =====================================================
  // BRANCH NAME
  // =====================================================

  doc.setFont('helvetica', 'bold');

  doc.text(
    'Branch Name: ',
    10,
    20
  );

  doc.setFont('helvetica', 'normal');

  doc.text(
    branchName,
    32,
    20
  );


  // =====================================================
  // REPORT TIME
  // =====================================================

  doc.setFont('helvetica', 'bold');

  doc.text(
    'Report Time: ',
    pageWidth - 70,
    20
  );

  doc.setFont('helvetica', 'normal');

  doc.text(
    reportTime,
    pageWidth - 49,
    20
  );


  // =====================================================
  // TABLE HEADER
  // =====================================================

  const head = [[
    'Sr No.',
    'Employee Id',
    'Employee Name',
    'Category',
    'Department',
    'Designation',
    'Attendance Date',
    'Punches'
  ]];


  // =====================================================
  // TABLE BODY
  // =====================================================

  const body =
    this.reportData.map(
      (item: any, index: number) => [

        index + 1,

        item.enrollId ?? '-',

        item.employeeName ?? '-',

        item.category ?? '-',

        item.department ?? '-',

        item.designation ?? '-',

        item.attendanceDate ?? '-',

        ''
      ]
    );


  // =====================================================
  // TABLE
  // =====================================================

  autoTable(doc, {

    head: head as any,

    body: body,

    startY: 30,

    theme: 'grid',

    tableWidth: 'auto',


    // ===================================================
    // GENERAL STYLE
    // ===================================================

    styles: {

      font: 'helvetica',

      fontSize: 8,

      cellPadding: 2,

      overflow: 'linebreak',

      valign: 'middle',

      halign: 'center',

      lineWidth: 0.1,

      lineColor: [
        200,
        200,
        200
      ]

    },


    // ===================================================
    // HEADER STYLE
    // ===================================================

    headStyles: {

      fillColor: [
        0,
        150,
        220
      ],

      textColor: [
        255,
        255,
        255
      ],

      fontStyle: 'bold',

      halign: 'center',

      valign: 'middle',

      lineWidth: 0.2,

      lineColor: [
        0,
        100,
        160
      ]

    },


    // ===================================================
    // COLUMN WIDTH
    // ===================================================

    columnStyles: {

      // Sr No
      0: {
        cellWidth: 14,
        halign: 'center'
      },

      // Employee Id
      1: {
        cellWidth: 24,
        halign: 'center'
      },

      // Employee Name
      2: {
        cellWidth: 42,
        halign: 'left'
      },

      // Category
      3: {
        cellWidth: 32,
        halign: 'left'
      },

      // Department
      4: {
        cellWidth: 38,
        halign: 'left'
      },

      // Designation
      5: {
        cellWidth: 38,
        halign: 'left'
      },

      // Attendance Date
      6: {
        cellWidth: 32,
        halign: 'center'
      },

      // =================================================
      // PUNCHES
      // =================================================
      7: {
        cellWidth: 61,
        halign: 'left',
        valign: 'middle',
        overflow: 'hidden'
      }

    },


    margin: {

      top: 30,

      right: 8,

      bottom: 15,

      left: 8

    },


    showHead: 'firstPage',


    // =====================================================
    // CALCULATE ROW HEIGHT
    // =====================================================

    didParseCell: (data: any) => {

      if (
        data.column.index !== 7 ||
        data.cell.section !== 'body'
      ) {
        return;
      }


      const rowIndex =
        data.row.index;

      const row =
        this.reportData[rowIndex];


      if (!row) {
        return;
      }


      const punches =
        this.getPunches(
          row?.ioStatus
        );


      if (
        !punches ||
        punches.length === 0
      ) {

        data.cell.styles.minCellHeight = 8;

        return;
      }


      // =================================================
      // IMPORTANT
      // USE ACTUAL CELL WIDTH
      // =================================================

      const padding = 2;

      const cellWidth =
        data.cell.width;

      const availableWidth =
        cellWidth -
        (padding * 2) -
        1;


      // Space required for comma
      const separatorWidth = 4;

      const lineHeight = 4.5;


      const lines: string[][] = [];

      let currentLine: string[] = [];

      let currentWidth = 0;


      // =================================================
      // CREATE LINES
      // =================================================

      punches.forEach(
        (punch: string) => {

          // Remove unwanted spaces
          punch =
            String(punch).trim();


          const punchWidth =
            doc.getTextWidth(punch);


          const requiredWidth =
            currentLine.length === 0
              ? punchWidth
              : separatorWidth +
                punchWidth;


          // =================================================
          // CHECK BEFORE ADDING
          // =================================================

          if (
            currentLine.length > 0 &&
            currentWidth +
            requiredWidth >
            availableWidth
          ) {

            lines.push(
              currentLine
            );


            currentLine = [
              punch
            ];


            currentWidth =
              punchWidth;

          } else {

            currentLine.push(
              punch
            );


            currentWidth +=
              requiredWidth;

          }

        }
      );


      // =================================================
      // LAST LINE
      // =================================================

      if (
        currentLine.length > 0
      ) {

        lines.push(
          currentLine
        );

      }


      // =================================================
      // ROW HEIGHT
      // =================================================

      const requiredHeight =
        Math.max(
          8,
          (lines.length * lineHeight) + 4
        );


      data.cell.styles.minCellHeight =
        requiredHeight;

    },


    // =====================================================
    // DRAW PUNCHES
    // =====================================================

    didDrawCell: (data: any) => {

      if (
        data.column.index !== 7 ||
        data.cell.section !== 'body'
      ) {
        return;
      }


      const rowIndex =
        data.row.index;

      const row =
        this.reportData[rowIndex];


      if (!row) {
        return;
      }


      const punches =
        this.getPunches(
          row?.ioStatus
        );


      if (
        !punches ||
        punches.length === 0
      ) {
        return;
      }


      // =================================================
      // CELL INFORMATION
      // =================================================

      const cell =
        data.cell;

      const padding = 2;

      const lineHeight = 4.5;


      // LEFT & RIGHT BOUNDARY
      const startX =
        cell.x + padding;

      const endX =
        cell.x +
        cell.width -
        padding;


      const availableWidth =
        endX - startX;


      // =================================================
      // CREATE LINES
      // =================================================

      const lines: string[][] = [];

      let currentLine: string[] = [];

      let currentWidth = 0;


      // IMPORTANT
      // Same separator width used everywhere
      const separatorWidth = 4;


      punches.forEach(
        (punch: string) => {

          punch =
            String(punch).trim();


          const punchWidth =
            doc.getTextWidth(punch);


          const requiredWidth =
            currentLine.length === 0
              ? punchWidth
              : separatorWidth +
                punchWidth;


          // =================================================
          // STRICT RIGHT BOUNDARY CHECK
          // =================================================

          if (
            currentLine.length > 0 &&
            currentWidth +
            requiredWidth >
            availableWidth
          ) {

            lines.push(
              currentLine
            );


            currentLine = [
              punch
            ];


            currentWidth =
              punchWidth;

          } else {

            currentLine.push(
              punch
            );


            currentWidth +=
              requiredWidth;

          }

        }
      );


      // =================================================
      // LAST LINE
      // =================================================

      if (
        currentLine.length > 0
      ) {

        lines.push(
          currentLine
        );

      }


      // =================================================
      // CALCULATE Y
      // =================================================

      const totalHeight =
        lines.length *
        lineHeight;


      let y =
        cell.y +
        (
          cell.height -
          totalHeight
        ) / 2 +
        3;


      // =================================================
      // DRAW EACH LINE
      // =================================================

      lines.forEach(
        (line: string[]) => {

          let x =
            startX;


          line.forEach(
            (
              punch: string,
              index: number
            ) => {

              // =================================================
              // SAFETY CHECK
              // =================================================

              const punchWidth =
                doc.getTextWidth(punch);


              // If punch is still going outside,
              // don't draw outside the cell.
              if (
                x + punchWidth >
                endX
              ) {
                return;
              }


              doc.setTextColor(0, 0, 0);

              // =================================================
              // DRAW PUNCH
              // =================================================

              doc.text(
                punch,
                x,
                y
              );


              // =================================================
              // MOVE X
              // =================================================

              x +=
                punchWidth;


              // =================================================
              // DRAW COMMA
              // =================================================

              if (
                index <
                line.length - 1
              ) {

                // Make sure comma also stays inside cell
                if (
                  x + 4 <= endX
                ) {

                  doc.setTextColor(
                    0,
                    0,
                    0
                  );


                  doc.text(
                    ',',
                    x + 1,
                    y
                  );


                  x += 4;

                }

              }

            }
          );


          // =================================================
          // NEXT LINE
          // =================================================

          y +=
            lineHeight;

        }
      );


      // =================================================
      // RESET COLOR
      // =================================================

      doc.setTextColor(
        0,
        0,
        0
      );

    },


    // =====================================================
    // PAGE NUMBER
    // =====================================================

    didDrawPage: () => {

      const pageNumber =
        doc.getNumberOfPages();

      const currentPageHeight =
        doc.internal.pageSize.getHeight();


      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(8);

      doc.setTextColor(
        0,
        0,
        0
      );


      doc.text(
        `Page ${pageNumber}`,
        pageWidth - 10,
        currentPageHeight - 5,
        {
          align: 'right'
        }
      );

    }

  });


  // =====================================================
  // SAVE PDF
  // =====================================================

  doc.save(
    'Multiple_Punches_Report.pdf'
  );

}


// async onExportExcel(): Promise<void> {

//   if (!this.reportData || this.reportData.length === 0) {
//     this.toaster.error('No attendance data available for export');
//     return;
//   }

//   const branchName = this.getSelectedLocationName() || 'All';
//   const fDate = this.formatExportDate(this.fromDate);
//   const tDate = this.formatExportDate(this.toDate);
//   const reportTime = this.formatExportDateTime(new Date());

//   const startWorkingTime =
//     this.formatTime(this.workingHoursSetTime?.inTime) || 'N/A';

//   const endWorkingTime =
//     this.formatTime(this.workingHoursSetTime?.outTime) || 'N/A';


//   // =====================================================
//   // CREATE WORKBOOK
//   // =====================================================

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Punch Report');


//   // =====================================================
//   // REPORT DETAILS
//   // =====================================================

//   worksheet.mergeCells('A1:H1');
//   worksheet.getCell('A1').value = 'Multiple Punches Report';

//   worksheet.getCell('A1').font = {
//     bold: true,
//     size: 14
//   };

//   worksheet.getCell('A1').alignment = {
//     horizontal: 'center',
//     vertical: 'middle'
//   };


//   worksheet.mergeCells('A2:H2');
//   worksheet.getCell('A2').value =
//     `From Date: ${fDate} to ${tDate}`;

//   worksheet.getCell('A2').alignment = {
//     horizontal: 'center'
//   };


//   worksheet.mergeCells('A3:C3');
//   worksheet.getCell('A3').value =
//     `Branch Name: ${branchName}`;

//   worksheet.getCell('A3').alignment = {
//     horizontal: 'center'
//   };


//   worksheet.mergeCells('D3:H3');
//   worksheet.getCell('D3').value =
//     `Report Time: ${reportTime}`;

//   worksheet.getCell('D3').alignment = {
//     horizontal: 'center'
//   };


//   worksheet.getCell('A4').value =
//     `Start Working Time : ${startWorkingTime}`;

//   worksheet.getCell('A4').alignment = {
//     horizontal: 'left',
//     vertical: 'middle'
//   };

//   worksheet.getCell('C4').value =
//     `End Working Time : ${endWorkingTime}`;

//   worksheet.getCell('C4').alignment = {
//     horizontal: 'left',
//     vertical: 'middle'
//   };


//   // =====================================================
//   // HEADER
//   // =====================================================

//   const headerRow = worksheet.addRow([
//     'Sr No.',
//     'Employee ID',
//     'Employee Name',
//     'Category',
//     'Department',
//     'Designation',
//     'Attendance Date',
//     'Punches'
//   ]);


//   headerRow.font = {
//     bold: true,
//     color: {
//       argb: 'FFFFFFFF'
//     }
//   };

//   headerRow.alignment = {
//     horizontal: 'center',
//     vertical: 'middle'
//   };

//   headerRow.fill = {
//     type: 'pattern',
//     pattern: 'solid',
//     fgColor: {
//       argb: '0096DC'
//     }
//   };


//   // =====================================================
//   // DATA
//   // =====================================================

//   this.reportData.forEach((item: any, index: number) => {

//     const row = worksheet.addRow([
//       index + 1,
//       item.enrollId ?? '',
//       item.employeeName ?? '',
//       item.category ?? '',
//       item.department ?? '',
//       item.designation ?? '',
//       item.attendanceDate ?? '',
//       ''
//     ]);


//     // ===================================================
//     // NORMAL CELL ALIGNMENT
//     // ===================================================

//     row.getCell(1).alignment = {
//       horizontal: 'center'
//     };

//     row.getCell(2).alignment = {
//       horizontal: 'center'
//     };

//     row.getCell(3).alignment = {
//       horizontal: 'left'
//     };

//     row.getCell(4).alignment = {
//       horizontal: 'left'
//     };

//     row.getCell(5).alignment = {
//       horizontal: 'left'
//     };

//     row.getCell(6).alignment = {
//       horizontal: 'left'
//     };

//     row.getCell(7).alignment = {
//       horizontal: 'center'
//     };


//     // ===================================================
//     // PUNCHES
//     // ===================================================

//     const punches = this.getPunches(item?.ioStatus);

//     const punchCell = row.getCell(8);

//     punchCell.value = '';

//     punchCell.alignment = {
//       horizontal: 'left',
//       vertical: 'middle',
//       wrapText: true
//     };


//     // Rich text - each punch can have different color
//     punchCell.value = {
//       richText: punches.map(
//         (punch: string, punchIndex: number) => {

//           const isContinuousDuplicate =
//             this.isContinuousDuplicatePunch(
//               punch,
//               item?.ioStatus
//             );

//           const isLateEarly =
//             this.isLateEarlyPunch(
//               punch,
//               item?.lateEarly
//             );


//           return {
//             text:
//               punch +
//               (punchIndex < punches.length - 1
//                 ? ', '
//                 : ''),

//             font: {
//               color: {
//                 // DUPLICATE SAME-STATUS PUNCHES TAKE YELLOW PRIORITY
//                 argb: isContinuousDuplicate
//                   ? 'FFFACC15'   // YELLOW
//                   : isLateEarly
//                     ? 'FFDC2626' // RED
//                     : 'FF000000' // BLACK
//               }
//             }
//           };

//         }
//       )
//     };


//     // ===================================================
//     // ROW HEIGHT
//     // ===================================================

//     const lineCount =
//       Math.ceil(
//         punches.length / 8
//       );

//     row.height = Math.max(
//       20,
//       lineCount * 18
//     );

//   });


//   // =====================================================
//   // COLUMN WIDTH
//   // =====================================================

//   worksheet.getColumn(1).width = 10;
//   worksheet.getColumn(2).width = 15;
//   worksheet.getColumn(3).width = 25;
//   worksheet.getColumn(4).width = 20;
//   worksheet.getColumn(5).width = 25;
//   worksheet.getColumn(6).width = 25;
//   worksheet.getColumn(7).width = 18;
//   worksheet.getColumn(8).width = 55;


//   // =====================================================
//   // BORDERS
//   // =====================================================

//   worksheet.eachRow((row, rowNumber) => {

//     if (rowNumber >= 6) {

//       row.eachCell((cell) => {

//         cell.border = {
//           top: {
//             style: 'thin',
//             color: {
//               argb: 'FFD0D0D0'
//             }
//           },

//           left: {
//             style: 'thin',
//             color: {
//               argb: 'FFD0D0D0'
//             }
//           },

//           bottom: {
//             style: 'thin',
//             color: {
//               argb: 'FFD0D0D0'
//             }
//           },

//           right: {
//             style: 'thin',
//             color: {
//               argb: 'FFD0D0D0'
//             }
//           }
//         };

//       });

//     }

//   });


//   // =====================================================
//   // FREEZE HEADER
//   // =====================================================

//   worksheet.views = [
//     {
//       state: 'frozen',
//       ySplit: 5
//     }
//   ];


//   // =====================================================
//   // DOWNLOAD
//   // =====================================================

//   const buffer =
//     await workbook.xlsx.writeBuffer();

//   const blob = new Blob(
//     [buffer],
//     {
//       type:
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     }
//   );

//   saveAs(
//     blob,
//     'Multiple_Punches_Report.xlsx'
//   );

// }


async onExportExcel(): Promise<void> {

  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No attendance data available for export');
    return;
  }

  const branchName = this.getSelectedLocationName() || 'All';
  const fDate = this.formatExportDate(this.fromDate);
  const tDate = this.formatExportDate(this.toDate);
  const reportTime = this.formatExportDateTime(new Date());

  // =====================================================
  // CREATE WORKBOOK
  // =====================================================

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Punch Report');


  // =====================================================
  // REPORT DETAILS
  // =====================================================

  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = 'Multiple Punches Report';

  worksheet.getCell('A1').font = {
    bold: true,
    size: 14
  };

  worksheet.getCell('A1').alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };


  worksheet.mergeCells('A2:H2');
  worksheet.getCell('A2').value =
    `From Date: ${fDate} to ${tDate}`;

  worksheet.getCell('A2').alignment = {
    horizontal: 'center'
  };


  worksheet.mergeCells('A3:D3');
  worksheet.getCell('A3').value =
    `Branch Name: ${branchName}`;

  worksheet.getCell('A3').alignment = {
    horizontal: 'center'
  };


  worksheet.mergeCells('E3:H3');
  worksheet.getCell('E3').value =
    `Report Time: ${reportTime}`;

  worksheet.getCell('E3').alignment = {
    horizontal: 'center'
  };


  // =====================================================
  // HEADER
  // =====================================================

  const headerRow = worksheet.addRow([
    'Sr No.',
    'Employee ID',
    'Employee Name',
    'Category',
    'Department',
    'Designation',
    'Attendance Date',
    'Punches'
  ]);

  // Simple header format
  headerRow.font = {
    bold: true
  };

  headerRow.alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };


  // =====================================================
  // DATA
  // =====================================================

  this.reportData.forEach((item: any, index: number) => {

    const row = worksheet.addRow([
      index + 1,
      item.enrollId ?? '',
      item.employeeName ?? '',
      item.category ?? '',
      item.department ?? '',
      item.designation ?? '',
      item.attendanceDate ?? '',
      ''
    ]);


    // ===================================================
    // NORMAL CELL ALIGNMENT
    // ===================================================

    row.getCell(1).alignment = {
      horizontal: 'center'
    };

    row.getCell(2).alignment = {
      horizontal: 'center'
    };

    row.getCell(3).alignment = {
      horizontal: 'left'
    };

    row.getCell(4).alignment = {
      horizontal: 'left'
    };

    row.getCell(5).alignment = {
      horizontal: 'left'
    };

    row.getCell(6).alignment = {
      horizontal: 'left'
    };

    row.getCell(7).alignment = {
      horizontal: 'center'
    };


    // ===================================================
    // PUNCHES
    // ===================================================

    const punches = this.getPunches(item?.ioStatus);

    const punchCell = row.getCell(8);

    punchCell.value = '';

    punchCell.alignment = {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true
    };


    // Keep the response punch values unchanged in the export.
    punchCell.value = {
      richText: [{
        text: punches.join(', '),
        font: {
          color: {
            argb: 'FF000000'
          }
        }
      }]
    };


    // ===================================================
    // ROW HEIGHT
    // ===================================================

    const lineCount =
      Math.ceil(
        punches.length / 8
      );

    row.height = Math.max(
      20,
      lineCount * 18
    );

  });


  // =====================================================
  // COLUMN WIDTH
  // =====================================================

  worksheet.getColumn(1).width = 10;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 25;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 25;
  worksheet.getColumn(6).width = 25;
  worksheet.getColumn(7).width = 18;
  worksheet.getColumn(8).width = 55;


  // =====================================================
  // BORDERS
  // =====================================================

  worksheet.eachRow((row, rowNumber) => {

    if (rowNumber >= 6) {

      row.eachCell((cell) => {

        cell.border = {
          top: {
            style: 'thin',
            color: {
              argb: 'FFD0D0D0'
            }
          },

          left: {
            style: 'thin',
            color: {
              argb: 'FFD0D0D0'
            }
          },

          bottom: {
            style: 'thin',
            color: {
              argb: 'FFD0D0D0'
            }
          },

          right: {
            style: 'thin',
            color: {
              argb: 'FFD0D0D0'
            }
          }
        };

      });

    }

  });


  // =====================================================
  // FREEZE HEADER
  // =====================================================

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 5
    }
  ];


  // =====================================================
  // DOWNLOAD
  // =====================================================

  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob = new Blob(
    [buffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  );

  saveAs(
    blob,
    'Multiple_Punches_Report.xlsx'
  );

}







// onExportExcel(): void {

//   // Check data
//   if (!this.reportData || this.reportData.length === 0) {
//     this.toaster.error('No attendance data available for export');
//     return;
//   }

//   const branchName = this.getSelectedLocationName() || 'All';
//   const fDate = this.formatExportDate(this.fromDate);
//   const tDate = this.formatExportDate(this.toDate);
//   const reportTime = this.formatExportDateTime(new Date());
//   const startWorkingTime = this.formatTime(this.workingHoursSetTime?.inTime) || 'N/A';
//   const endWorkingTime = this.formatTime(this.workingHoursSetTime?.outTime) || 'N/A';

//   // Prepare Excel data
//   const excelData = this.reportData.map((item: any, index: number) => {

//     return {
//       'Sr No.': index + 1,
//       'Employee ID': item.enrollId ?? '',
//       'Employee Name': item.employeeName ?? '',
//       'Category': item.category ?? '',
//       'Department': item.department ?? '',
//       'Designation': item.designation ?? '',
//       'Attendance Date': item.attendanceDate ?? '',
//       'Punches': item.ioStatus ?? ''
//     };

//   });

//   // Create worksheet
//   const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
//     [],
//     [],
//     [],
//     [],
//     [],
//     Object.keys(excelData[0]),
//     ...excelData.map((item: any) => Object.values(item))
//   ]);

//   XLSX.utils.sheet_add_aoa(worksheet, [
//     [{ v: 'Multiple Punches Report', t: 's', s: { alignment: { horizontal: 'center' }, font: { bold: true } } }],
//     [{ v: `From Date: ${fDate} to ${tDate}`, t: 's', s: { alignment: { horizontal: 'center' } } }],
//     [`Branch Name: ${branchName}`, '', '', '', `Report Time: ${reportTime}`],
//     [`Start Working Time : ${startWorkingTime}`, '', '', '', `End Working Time : ${endWorkingTime}`]
//   ], { origin: 'A1' });

//   worksheet['A1'].s = { alignment: { horizontal: 'center' }, font: { bold: true } };
//   worksheet['A2'].s = { alignment: { horizontal: 'center' } };
//   worksheet['A3'].s = { alignment: { horizontal: 'center' } };
//   worksheet['E3'].s = { alignment: { horizontal: 'center' } };
//   worksheet['A4'].s = { alignment: { horizontal: 'center' } };
//   worksheet['E4'].s = { alignment: { horizontal: 'center' } };

//   worksheet['!merges'] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
//     { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
//     { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
//     { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } },
//     { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
//     { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } }
//   ];

//   // Set column widths
//   worksheet['!cols'] = [
//     { wch: 10 },  // Sr No.
//     { wch: 15 },  // Employee ID
//     { wch: 25 },  // Employee Name
//     { wch: 20 },  // Attendance Date
//     { wch: 20 }   // IN / OUT Status
//   ];

//   // Create workbook
//   const workbook: XLSX.WorkBook =
//     XLSX.utils.book_new();

//   // Add worksheet
//   XLSX.utils.book_append_sheet(
//     workbook,
//     worksheet,
//     'Punch Report'
//   );

//   // Generate and download Excel
//   XLSX.writeFile(
//     workbook,
//     'Multiple_Punches_Report.xlsx'
//   );
// }



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

removeCategory(categoryId: any, event: MouseEvent): void {
  event.stopPropagation();

  this.selectedCategoryIds =
    this.selectedCategoryIds.filter(
      (id: any) => id !== categoryId
    );
}

}

