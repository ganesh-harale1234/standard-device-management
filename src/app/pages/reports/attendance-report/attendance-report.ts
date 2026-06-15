import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data-service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-attendance-report',
  imports: [SharedModule, CommonModule],
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
 dataSource: any
constructor(private dataService:DataService, private toaster:ToastrService){

}


  ngOnInit(): void {
  this.getallDataLocation();
  this.roleId = sessionStorage.getItem('rollId')

  }

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


// Location list
locationList: any[] = [];

selectedLocationIds: string[] = [];

getallDataLocation() {
  this.dataService.getAllData('findAllLocation').subscribe(
    (res: any) => {
      if (res.code === 100) {
        this.locationList = res.extend.data;
      } else if (res.code === 500) {
        this.toaster.error('Internal server error !');
      } else {
        this.toaster.error('Something went wrong !');
      }
    },
    (err) => {
      const errorMsg = err.error.msg || 'Failed to load Location list !';
      this.toaster.error(errorMsg);
    }
  );
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


// AttendencesReport() {
//   const fromDate = this.formatDateToYMD(this.fromDate);
//   const toDate   = this.formatDateToYMD(this.toDate);

//   let apiUrl: string;
//   let requestData: any = { fromDate, toDate };

//   // LOCATION 
//   if (Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0) {
//     apiUrl = 'getLocationwiseMultiplePunchesReport';
//     requestData.BranchId = this.selectedLocationIds;
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
//       if (!(Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0)
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
    apiUrl = 'getEmpWiseMultiplePunchReport';
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

    pdf.save('Attendance Report.pdf');
  });
}



}
