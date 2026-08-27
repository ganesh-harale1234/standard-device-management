import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared-module';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { NgSelectModule } from '@ng-select/ng-select';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-master-report',
  imports: [FormsModule, CommonModule, NgSelectModule, SharedModule],
  templateUrl: './master-report.html',
  styleUrl: './master-report.scss',
})
export class MasterReport {

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

  reportData:any = [];
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
  this.getallData()
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



// masterReport() {
//    this.reportData = [];
   
//   const fromDate = this.formatDateToYMD(this.fromDate);
//   const toDate   = this.formatDateToYMD(this.toDate);

//   let apiUrl: string;
//   let requestData: any = { fromDate, toDate };

//   // LOCATION 

// // All select Fields Send api

// if (Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0 && this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
//   apiUrl = 'masterReport';
//    requestData.locationIdList = this.selectedLocationIds;
//     requestData.employeeId = this.selectedEmployeeId; 
// }

//   // EMPLOYEE 
//   else if (this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
//     apiUrl = 'masterReport';
//     requestData.employeeId = this.selectedEmployeeId;
//     // requestData.rollId = this.roleId;
//   }
//   else if(Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0){
//     apiUrl = 'masterReportWithLocationDate';
//     requestData.locationId = this.selectedLocationIds;
//   }

//   //  date-based call
//   else {
//     apiUrl = 'masterReportWithDate';
//   }

//   this.dataService.addData(apiUrl, requestData).subscribe((res: any) => {

// if(res.code==100){
 
//     this.reportData = res.extend?.masterReportList;
// }else if(res.code == 200){
//         this.toaster.error(res.msg);
//          this.reportData = [];
// }
//     else if (res.code === 500) {
//           this.toaster.error(res.msg);
//     }else{
//       this.toaster.error("Something went wrong !..")
//     }
//   });
// }

masterReport() {
  this.reportData = [];
   
  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate   = this.formatDateToYMD(this.toDate);

  let apiUrl: string;
  let requestData: any = { fromDate, toDate };

  // LOCATION 

  // All select Fields Send api

  if (Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0 && this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
    apiUrl = 'masterReport';
    requestData.locationIdList = this.selectedLocationIds;
    requestData.employeeId = this.selectedEmployeeId; 
  }

  // EMPLOYEE 
  else if (this.selectedEmployeeId != null && this.selectedEmployeeId !== '') {
    apiUrl = 'masterReport';
    requestData.employeeId = this.selectedEmployeeId;
    // requestData.rollId = this.roleId;
  }
  else if(Array.isArray(this.selectedLocationIds) && this.selectedLocationIds.length > 0){
    apiUrl = 'masterReportWithLocationDate';
    requestData.locationId = this.selectedLocationIds;
  }

  // date-based call
  else {
    apiUrl = 'masterReportWithDate';
  }

  this.spinner.show();

  this.dataService.addData(apiUrl, requestData).subscribe(
    (res: any) => {

      this.spinner.hide();

      if(res.code==100){
        this.reportData = res.extend?.masterReportList;
      }
      else if(res.code == 200){
        this.toaster.error(res.msg);
            this.spinner.hide();
        this.reportData = [];
      }
      else if (res.code === 500) {
        this.toaster.error(res.msg);
            this.spinner.hide();
      }
      else{
        this.toaster.error("Something went wrong !..");
      }
    },
    (error: any) => {

      this.spinner.hide();

      console.error('Master Report API Error:', error);

      this.toaster.error(
        'Unable to fetch master report. Please try again later.'
      );

      this.reportData = [];
    }
  );
}

// locationid:any[]=[]

// onLocationChange(locationId: any) {
//   const selectedValue = locationId && typeof locationId === 'object'
//     ? locationId.locationId ?? locationId.id ?? null
//     : locationId ?? null;

//   this.selectedLocationId = selectedValue ?? null;
//   this.locationid = selectedValue != null ? [selectedValue] : [];
//   console.log(this.locationid);
// }

// onLocationClear() {
//   this.selectedLocationId = null;
//   this.locationid = [];
//   console.log(this.locationid);
// }

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
  employeeId: employeeId || null,
  locationId: locationId ? [locationId] : [],
   categoryIdList: this.selectedCategoryIds,
};

    this.dataService.viewmasterReportDetails(requestData).subscribe((res: any) => {
      if (res.code === 100) {
        this.reportData = res.extend?.masterReportList;
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


downloadPDF() {
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No employee data available for export');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const branchName = this.getSelectedLocationName() || 'All';
  // const fromDateValue = this.fromDate ? this.formatDateToYMD(this.fromDate) : null;
  // const toDateValue = this.toDate ? this.formatDateToYMD(this.toDate) : null;
  // const fDate = fromDateValue || 'N/A';
  // const tDate = toDateValue || 'N/A';
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
  doc.text('Master Report', pageWidth / 2, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  // doc.text(`From Date: ${fDate} to ${tDate}`, pageWidth / 2, 15, { align: 'center' });

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
    { content: 'Designation' },
      { content: 'Department' }, 
       { content: 'Category' },
    { content: 'Image' },
    { content: 'Date' },
    { content: 'Status' }
  ]];

  const body = this.reportData.map((item: any, index: number) => [
    index + 1,
    item.employeeId ?? '-',
    item.employeeName ?? '-',
    item.designation ?? '-',
    item.department ?? '-',
    item.category ?? '-',
    item.image ?? item.imageAvailable ?? '-',
    item.date ?? item.createdDate ?? '-',
    item.status ?? '-'
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

  doc.save('Master_Report.pdf');
}



// onExportExcel(): void {

//   // Check data
//   if (!this.reportData || this.reportData.length === 0) {
//     this.toaster.error('No employee data available for export');
//     return;
//   }

//   const branchName = this.getSelectedLocationName() || 'All';
//   // const fromDateValue = this.fromDate ? this.formatDateToYMD(this.fromDate) : null;
//   // const toDateValue = this.toDate ? this.formatDateToYMD(this.toDate) : null;
//   // const fDate = fromDateValue || 'N/A';
//   // const tDate = toDateValue || 'N/A';
//   const reportTime = new Date().toLocaleString('en-US', {
//     month: 'short',
//     day: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: true
//   });

//   // Prepare Excel data - same headings as table
//   const excelData = this.reportData.map((item: any, index: number) => {
//     return {
//       'Sr No.': index + 1,
//       'Employee Id': item.employeeId ?? '',
//       'Employee Name': item.employeeName ?? '',
//       'Designation': item.designation ?? '',
//       'Department': item.department ?? '',
//       'Category': item.category ?? '',
//       'Image': item.image ?? item.imageAvailable ?? '',
//       'Date': item.date ?? item.createdDate ?? '',
//       'Status': item.status ?? ''
//     };
//   });

//   // Create worksheet
//   const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
//     [],
//     [],
//     [],
//     [],
//     Object.keys(excelData[0]),
//     ...excelData.map((item: any) => Object.values(item))
//   ]);

//   XLSX.utils.sheet_add_aoa(worksheet, [
//     [{ v: 'Master Report', t: 's', s: { alignment: { horizontal: 'center' }, font: { bold: true } } }],
//     // [{ v: `From Date: ${fDate} to ${tDate}`, t: 's', s: { alignment: { horizontal: 'center' } } }],
//     [`Branch Name: ${branchName}`, '', '', '', '', '', '', `Report Time: ${reportTime}`]
//   ], { origin: 'A1' });

//   worksheet['A1'].s = { alignment: { horizontal: 'center' }, font: { bold: true } };
//   worksheet['A2'].s = { alignment: { horizontal: 'center' } };

//   worksheet['A3'].s = { alignment: { horizontal: 'center' } };
//   worksheet['H3'].s = { alignment: { horizontal: 'center' } };

//   worksheet['!merges'] = [
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
//     { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
//     { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
//     { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } }
//   ];

//   // Set column widths - same order as table
//   worksheet['!cols'] = [
//     { wch: 10 }, // Sr No.
//     { wch: 18 }, // Employee Id
//     { wch: 25 }, // Employee Name
//     { wch: 25 }, // Designation
//     { wch: 15 }, // Image
//     { wch: 18 }, // Date
//     { wch: 15 }  // Status
//   ];

//   // Create workbook
//   const workbook: XLSX.WorkBook =
//     XLSX.utils.book_new();

//   // Add worksheet
//   XLSX.utils.book_append_sheet(
//     workbook,
//     worksheet,
//     'Employee Report'
//   );

//   // Download Excel
//   XLSX.writeFile(
//     workbook,
//     'Employee_Master_Report.xlsx'
//   );
// }
  

onExportExcel(): void {

  // Check data
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No employee data available for export');
    return;
  }

  const branchName = this.getSelectedLocationName() || 'All';

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
      'Employee Id': item.employeeId ?? '',
      'Employee Name': item.employeeName ?? '',
      'Designation': item.designation ?? '',
      'Department': item.department ?? '',
      'Category': item.category ?? '',
      'Image': item.image ?? item.imageAvailable ?? '',
      'Date': item.date ?? item.createdDate ?? '',
      'Status': item.status ?? ''
    };
  });

  // Create worksheet
  const headers = Object.keys(excelData[0]);

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
    ['Master Report'],
    [`Branch Name: ${branchName}`, '', '', '', '', '', '', `Report Time: ${reportTime}`],
    [],
    [],
    headers,
    ...excelData.map((item: any) => Object.values(item))
  ]);

  // Merge title
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // A1:I1
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // A2:D2
    { s: { r: 1, c: 7 }, e: { r: 1, c: 8 } }  // H2:I2
  ];

  // Apply styles safely
  worksheet['A1'].s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },
    font: {
      bold: true
    }
  };

  worksheet['A2'].s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    }
  };

  worksheet['H2'].s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    }
  };

  // Set column widths - 9 columns
  worksheet['!cols'] = [
    { wch: 10 }, // Sr No.
    { wch: 18 }, // Employee Id
    { wch: 25 }, // Employee Name
    { wch: 25 }, // Designation
    { wch: 18 }, // Department
    { wch: 18 }, // Category
    { wch: 18 }, // Image
    { wch: 18 }, // Date
    { wch: 15 }  // Status
  ];

  // Create workbook
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();

  // Add worksheet
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Employee Report'
  );

  // Download Excel
  XLSX.writeFile(
    workbook,
    'Employee_Master_Report.xlsx'
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
