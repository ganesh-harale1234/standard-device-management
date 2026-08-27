import { Component } from '@angular/core';
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
import autoTable from 'jspdf-autotable';
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-contractor-wise-report',
  imports: [CommonModule, SharedModule, FormsModule,NgSelectModule],

  templateUrl: './contractor-wise-report.html',
  styleUrl: './contractor-wise-report.scss',
})
export class ContractorWiseReport {
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
 dataSource: any
constructor(private dataService:DataService, private toaster:ToastrService, private spinner:NgxSpinnerService){

}

getAllListdepartment:any[] = []


locationID:any;
RoleName:any;
locationName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');
  this.locationName =  sessionStorage.getItem('locationName');
  this.getallDataLocation();
  this.getallDatadepartment();
  this.getallData()
  this.roleId = sessionStorage.getItem('rollId')

  }

     getallDatadepartment(){
    this.dataService.getAllData('findAllcontractors').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllListdepartment = res.extend.allContractors;
         
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, 
  )
  }

  selectedDeptId:any;

  getContractorId(event:any){
    this.selectedDeptId = event.target.value;
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
onLocationChange(event: any) {
  this.selectedLocationName = event.locationName;
}







AuditReport() {

  this.reportData = [];

  // Branch Mandatory
  if (this.RoleName !== 'Branch Admin' && this.selectlocationId == null) {
    this.toaster.error('Please select a Branch');
    return;
  }

  if (!this.selectedCategoryIds || this.selectedCategoryIds.length === 0) {
  this.toaster.error('Please select one category...!');
  return;
}

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  // Branch Admin -> sessionStorage locationId
  // Other Role -> selected branch locationId
  const locationId =
    this.RoleName === 'Branch Admin'
      ? Number(this.locationID)
      : Number(this.selectlocationId);

  let apiUrl = '';

  let requestData: any = {
    fromDate,
    toDate,
    locationId: locationId,
      categoryIdList: this.selectedCategoryIds,
  };

  // Employee
  if (this.selectedEmployeeId) {

    apiUrl = 'getEmpWiseMultiplePunchReport';

    requestData = {
      fromDate,
      toDate,
      locationId: locationId,
      empId: this.selectedEmployeeId,
         categoryIdList: this.selectedCategoryIds,
    };

  }

  // Contractor
  else if (this.selectedDeptId) {

    apiUrl = 'contractorWiseReport';

    requestData = {
      fromDate,
      toDate,
      locationId: locationId,
      conId: Number(this.selectedDeptId),
      categoryIdList: this.selectedCategoryIds,
    };

  }

  // Date + Location
  else {

    apiUrl = 'contractorWiseReport';

    requestData = {
      fromDate,
      toDate,
      locationId: locationId,
            categoryIdList: this.selectedCategoryIds,

    };

  }

  this.spinner.show();

  this.dataService.addData(apiUrl, requestData).subscribe({
    next: (res: any) => {

      this.spinner.hide();

      if (res.code === 100) {
        this.reportData = res.extend?.contractorReportList || [];
      } else {
        this.toaster.error(res.msg || 'Something went wrong!');
        this.reportData = [];
      }

    },

    error: (err: any) => {

      this.spinner.hide();

      console.error('Audit Report API Error:', err);

      this.toaster.error(
        err?.error?.msg || 'Server side error!'
      );

      this.reportData = [];
    }
  });
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





onExportExcel(): void {

  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No contractor attendance data available for export');
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

  const excelData = this.reportData.map((item: any, index: number) => {

    return {
      'Sr No.': index + 1,
      'Employee ID': item.employeeId ?? '',
      'Employee Name': item.employeeName ?? '',
      'Category': item.category ?? '',
      'Department': item.department ?? '',
      'Designation': item.designation ?? '',
      'Contractor Name': item.contractorName ?? '',
      'Date': item.punchDate ?? '',
      'Punch In': item.punchIn ?? '',
      'Punch Out': item.punchOut ?? ''
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
    [{ v: 'Contractor Wise Report', t: 's', s: { alignment: { horizontal: 'center' }, font: { bold: true } } }],
    [{ v: `From Date: ${fDate} to ${tDate}`, t: 's', s: { alignment: { horizontal: 'center' } } }],
    [`Branch Name: ${branchName}`, '', '', '', '', '', '', `Report Time: ${reportTime}`]
  ], { origin: 'A1' });

  worksheet['A1'].s = { alignment: { horizontal: 'center' }, font: { bold: true } };
  worksheet['A2'].s = { alignment: { horizontal: 'center' } };
  worksheet['A3'].s = { alignment: { horizontal: 'center' } };
  worksheet['H3'].s = { alignment: { horizontal: 'center' } };

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 2, c: 7 }, e: { r: 2, c: 7 } }
  ];

  worksheet['!cols'] = [
    { wch: 10 }, // Sr No
    { wch: 15 }, // Employee ID
    { wch: 25 }, // Employee Name
    { wch: 25 }, // Contractor Name
    { wch: 20 }, // Location
    { wch: 15 }, // Punch Date
    { wch: 15 }, // Punch In
    { wch: 15 }  // Punch Out
  ];

  const workbook: XLSX.WorkBook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Contractor Attendance'
  );

  XLSX.writeFile(
    workbook,
    'Contractor_Attendance_Report.xlsx'
  );
}
  
onExportPdf() {
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No contractor attendance data available for export');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Contractor Wise Report', pageWidth / 2, 10, { align: 'center' });

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
    { content: 'Category' },
    { content: 'Department' },
    { content: 'Designation' },
    { content: 'Contractor Name' },
    // { content: 'Location' },
    { content: 'Punch Date' },
    { content: 'Punch In' },
    { content: 'Punch Out' }
  ]];

  const body = this.reportData.map((item: any, index: number) => [
    index + 1,
    item.employeeId ?? '-',
    item.employeeName ?? '-',
    item.category ?? '-',
    item.department ?? '-',
    item.designation ?? '-',
    item.contractorName ?? '-',
    // item.locationName ?? '-',
    item.punchDate ?? '-',
    item.punchIn ?? '-',
    item.punchOut ?? '-'
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

  doc.save('Contractor_Wise_Report.pdf');
}

selectedLocationName = '';
selectlocationId: number | null = null;

getSelectedLocationName() {

  if (this.RoleName === 'Branch Admin') {
    return this.locationName || '';
  }

  return this.locationList.find(
    (x: any) => x.locationId === this.selectlocationId
  )?.locationName || '';
}

}
