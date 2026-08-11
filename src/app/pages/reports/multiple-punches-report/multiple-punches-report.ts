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
import * as XLSX from 'xlsx';


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
constructor(private dataService:DataService, private toaster:ToastrService){

}

locationID:any;
RoleName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');
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

MultiplePunchesReport() {
     this.reportData = [];
  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate   = this.formatDateToYMD(this.toDate);

  let apiUrl: string;
  let requestData: any = { fromDate, toDate };

// All select Fields Send api

if (Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0 && this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
  apiUrl = 'getEmpWiseMultiplePunchReport';
   requestData.locationIdList = this.selectedLocationIds;
    requestData. id = this.selectedEmployeeId; 
}

  // EMPLOYEE 
  else if (this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
    apiUrl = 'getEmpWiseMultiplePunchReport';
    requestData.id = this.selectedEmployeeId;
    // requestData.rollId = this.roleId;
  }
  else if(Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0){
    apiUrl = 'getMultiplePunchesLocationDateReport';
    requestData.locationIdList = this.selectedLocationIds;
  }

  //  date-based call
  else {
    apiUrl = 'getMultiplePunchesReportWithDate';
  }

  this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {

if(res.code==100){
    this.reportData = res.extend?.punchList;
}else if(res.code == 200){
        this.toaster.error(res.msg);
}
    else if (res.code === 500) {
          this.toaster.error(res.msg);
    }else{
      this.toaster.error("Something went wrong !..")
    }
  });;
}
convertTime(time: string): Date | null {
  if (!time) return null;

  const today = new Date().toISOString().split('T')[0];
  return new Date(`${today}T${time}`);
}

selectlocationId: number | null = null;
  viewReportDetails() {
    if (this.selectlocationId == null) {
      this.toaster.error('Please select a Branch');
      return;
    }
    const employeeText = this.searchTextemp || null;
    const employeeId = employeeText? Number(employeeText.match(/\((\d+)\)/)?.[1]) || null : null;
    const fromDate = this.formatDateToYMD(this.fromDate);
    const toDate = this.formatDateToYMD(this.toDate);

    const requestData = {
      employeeId: employeeId || null,
      fromDate: fromDate,
      toDate: toDate,
      locationId: this.selectlocationId ? [this.selectlocationId] : []
    };

    this.dataService.viewmultiplePunchesReportDetails(requestData).subscribe((res: any) => {
      if (res.code === 100) {
        this.reportData = res.extend?.punchList;
        console.log('Report Details:', this.reportData);
      } else if (res.code === 200) {
        this.toaster.error(res.msg);
      } else if (res.code === 500) {
        this.toaster.error(res.msg);
      } else {
        this.toaster.error("Something went wrong!");
      }
    });

  }
   
  

  // onExportPdf() {

  // const DATA: any = document.getElementById('contentToConvert');

  // html2canvas(DATA).then(canvas => {
  //   const fileWidth = 208;
  //   const fileHeight = (canvas.height * fileWidth) / canvas.width;

  //   const FILEURI = canvas.toDataURL('image/png');
  //   let PDF = new jsPDF('p', 'mm', 'a4');
  //   let position = 0;

  //   PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
  //   PDF.save('Multiple Punches Report.pdf');
  // });


  // }

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

    pdf.save('Multiple Punches Report.pdf');
  });
}



onExportExcel(): void {

  // Check data
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No attendance data available for export');
    return;
  }

  // Prepare Excel data
  const excelData = this.reportData.map((item: any, index: number) => {

    return {
      'Sr No.': index + 1,
      'Employee ID': item.enrollId ?? '',
      'Employee Name': item.employeeName ?? '',
      'Attendance Date': item.attendanceDate ?? '',
      'IN / OUT Status': item.ioStatus ?? ''
    };

  });

  // Create worksheet
  const worksheet: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(excelData);

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
  return this.locationList.find(
    (x: any) => x.locationId === this.selectlocationId
  )?.locationName;
}

}

