import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data-service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-log-report',
  imports: [CommonModule, SharedModule, FormsModule, NgSelectModule],
  templateUrl: './log-report.html',
  styleUrl: './log-report.scss',
})
export class LogReport {

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


AuditReport() {

  this.reportData = [];

  // Branch Mandatory
  if (!this.selectlocationId) {
    this.toaster.error('Please select Branch');
    return;
  }

  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate = this.formatDateToYMD(this.toDate);

  const requestData = {
    fromDate,
    toDate,
    locationId: this.selectlocationId
  };

  this.dataService
    .addData('auditReport', requestData)
    .subscribe({
      next: (res: any) => {

        if (res.code === 100) {
          this.reportData = res.extend?.auditReport || [];
                                          // this.toaster.error(res.msg );

        } else if(res.code ===200) {
            this.reportData = [];
                                this.toaster.error(res.msg );

        }else{
                    this.toaster.error(res.msg || 'Something went wrong!');

        }

      },
      error: (err) => {
        this.toaster.error(err.error?.msg || 'Server Error');
      }
    });

}



onExportExcel(): void {

  // Check data
  if (!this.reportData || this.reportData.length === 0) {
    this.toaster.error('No audit report data available for export');
    return;
  }

  // Prepare Excel data
  const excelData = this.reportData.map((item: any, index: number) => {

    return {
      'Sr No.': index + 1,
      'Modified Date': item.modifiedDate ?? '',
      'Description': item.description ?? '',
      'Action': item.action ?? '',
      'By Whom': item.byWhom ?? ''
    };

  });

  // Create worksheet
  const worksheet: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 },  // Sr No.
    { wch: 20 },  // Modified Date
    { wch: 65 },  // Description
    { wch: 20 },  // Action
    { wch: 20 }   // By Whom
  ];

  // Create workbook
  const workbook: XLSX.WorkBook =
    XLSX.utils.book_new();

  // Add worksheet
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Audit Report'
  );

  // Download Excel
  XLSX.writeFile(
    workbook,
    'Log_Report.xlsx'
  );
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

    pdf.save('Log Report.pdf');
  });
}


selectedLocationName = '';
selectlocationId: number | null = null;
getSelectedLocationName() {
  return this.locationList.find(
    (x: any) => x.locationId === this.selectlocationId
  )?.locationName;
}




}


