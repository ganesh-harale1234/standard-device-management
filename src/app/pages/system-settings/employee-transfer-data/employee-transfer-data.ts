import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Device } from '../../dashboard/dashboard';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-module';
import { DataService } from '../../../services/data-service';
import * as XLSX from 'xlsx';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-employee-transfer-data',
  imports: [SharedModule,MatFormFieldModule, MatInputModule,NgSelectModule, MatIconModule],
  templateUrl: './employee-transfer-data.html',
  styleUrl: './employee-transfer-data.scss',
})
export class EmployeeTransferData {showFormData = false;
showTableData = true;

form: FormGroup;

// Device List
devicesList: any[] = [];

// Transfer Table Data
transferList: any[] = [];
filterallData: any[] = [];

// Access Group
accessGroupList: any[] = [];
selectedAccessGroupIds: number[] = [];
  fromDate: Date = new Date();
  toDate: Date = new Date();
  now: Date = new Date();
// Device Selection
selectedDeviceIds: number[] = [];
selectedDeviceSerialNums: string[] = [];

displayedColumns: string[] = [
  'id',
  'serialNum',
  'area',
  'deviceName',
  'ipAddress',
  'accessGroupName',
  'activity',
  'status'
];

dataSource = new MatTableDataSource<any>();

@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild('TABLE') table!: ElementRef;

constructor(
  private fb: FormBuilder,
  private dataService: DataService
) {
  this.form = this.fb.group({});
}

ngOnInit(): void {

  this.getDeviceallList();

  this.getAllempTransferlList();

  this.getallData();

}


formatDateToYMD(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();

  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}


AuditReport() {
  const fromDate = this.formatDateToYMD(this.fromDate);
  const toDate   = this.formatDateToYMD(this.toDate);

  let requestData: any = { fromDate, toDate };

// All select Fields Send api

const apiUrl:any = ""


  this.dataService.getAllData(`transferActivityTableDataByDateWise?fromDate=${fromDate}&toDate=${toDate}`)
    .subscribe((res: any) => {

      this.transferList = res?.extend?.data || [];

      this.filterallData = [...this.transferList];

      this.dataSource.data = this.filterallData;

    });
}


//================ Device ==================

getDeviceallList() {

  this.dataService.getAllData('device').subscribe((res: any) => {

    this.devicesList = res;

  });

}

//================ Transfer Activity ==================

getAllempTransferlList() {

  this.dataService
    .getAllData('transferActivityTableData')
    .subscribe((res: any) => {

      this.transferList = res?.extend?.data || [];

      this.filterallData = [...this.transferList];

      this.dataSource.data = this.filterallData;

      this.dataSource.paginator = this.paginator;

    });

}

//================ Access Group ==================

getallData() {

  this.dataService
    .getAllData('accessGroup/getAllAccessGroups')
    .subscribe((res: any) => {

      if (res.code == 100) {

        this.accessGroupList = res.extend.data;

      }

    });

}

//================ Device Selection ==================

get isAllSelected(): boolean {

  return this.selectedDeviceIds.length === this.devicesList.length &&
         this.devicesList.length > 0;

}

isSelected(id: number): boolean {

  return this.selectedDeviceIds.includes(id);

}

toggleDevice(id: number, event: any) {

  const device = this.devicesList.find((x: any) => x.id === id);

  if (!device) return;

  if (event.checked) {

    this.selectedDeviceIds.push(id);

    this.selectedDeviceSerialNums.push(device.serialNum);

  } else {

    this.selectedDeviceIds =
      this.selectedDeviceIds.filter(x => x !== id);

    this.selectedDeviceSerialNums =
      this.selectedDeviceSerialNums.filter(
        x => x !== device.serialNum
      );

  }

  this.getFilterdatDevicewise();

}

toggleSelectAll(event: any) {

  if (event.checked) {

    this.selectedDeviceIds =
      this.devicesList.map((x: any) => x.id);

    this.selectedDeviceSerialNums =
      this.devicesList.map((x: any) => x.serialNum);

  } else {

    this.selectedDeviceIds = [];

    this.selectedDeviceSerialNums = [];

  }

  this.getFilterdatDevicewise();

}

getDeviceName(id: number): string {

  const dev = this.devicesList.find((x: any) => x.id === id);

  return dev ? dev.deviceName : '';

}

//================ Access Group ==================

onAccessGroupChange() {

  this.getFilterdatDevicewise();

}

toggleSelectAllAccessGroups() {

  if (this.isAllAccessGroupSelected()) {

    this.selectedAccessGroupIds = [];

  } else {

    this.selectedAccessGroupIds =
      this.accessGroupList.map(
        (x: any) => x.accessGroupId
      );

  }

  this.getFilterdatDevicewise();

}

isAllAccessGroupSelected(): boolean {

  return this.accessGroupList.length > 0 &&
         this.selectedAccessGroupIds.length === this.accessGroupList.length;

}

//================ Filter API ==================

getFilterdatDevicewise() {

  const accessGroupIds =
    this.selectedAccessGroupIds.join(',');

  this.dataService
    .getAllData(
      'transferActivityTableData?accessGroupIds=' +
      accessGroupIds
    )
    .subscribe((res: any) => {

      this.transferList = res?.extend?.data || [];

      this.filterallData = [...this.transferList];

      this.dataSource.data = this.filterallData;

    });

}

//================ Export ==================

ExportTOExcel() {

  const ws: XLSX.WorkSheet =
    XLSX.utils.table_to_sheet(
      this.table.nativeElement
    );

  const wb: XLSX.WorkBook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    'Sheet1'
  );

  XLSX.writeFile(
    wb,
    'Employee-transfer.xlsx'
  );

}







// =========================
// Search Variables
// =========================

searchType: string = 'empId';
searchText: string = '';
selectedValue: string = '';
dropdownList: string[] = [];

// =========================
// Pagination
// =========================

pageIndex = 0;
pageSize = 10;
totalItems = 0;

// =========================
// Search Type Change
// =========================

onSearchTypeChange() {

  this.searchText = '';
  this.selectedValue = '';

  switch (this.searchType) {

    case 'activity':
      this.dropdownList = [
        ...new Set(
          this.transferList
            .map((x: any) => x.activity)
            .filter(Boolean)
        )
      ];
      break;

    case 'deviceName':
      this.dropdownList = [
        ...new Set(
          this.transferList
            .map((x: any) => x.deviceName)
            .filter(Boolean)
        )
      ];
      break;

    case 'status':
      this.dropdownList = ['Success', 'Pending'];
      break;

    default:
      this.dropdownList = [];
      break;

  }

  this.filterallData = [...this.transferList];
  this.applyPagination();

}

// =========================
// Dropdown Filter
// =========================

filterDropdown() {

  if (!this.selectedValue) {

    this.filterallData = [...this.transferList];

  } else {

    this.filterallData = this.transferList.filter((item: any) => {

      switch (this.searchType) {

        case 'activity':
          return item.activity === this.selectedValue;

        case 'deviceName':
          return item.deviceName === this.selectedValue;

        case 'status':
          return (item.status == 1 ? 'Success' : 'Pending') === this.selectedValue;

        default:
          return true;

      }

    });

  }

  this.applyPagination();

}
// =========================
// Search Input
// =========================

onSearchInput(event: any) {

  let value = event.target.value;

  if (this.searchType == 'empId') {

    value = value.replace(/[^0-9]/g, '');

  }

  this.searchText = value;

  event.target.value = value;

  this.filterDatas();

}

// =========================
// Text Search
// =========================

filterDatas() {

  const text = this.searchText.trim().toLowerCase();

  if (!text) {

    this.filterallData = [...this.transferList];

  } else {

    this.filterallData = this.transferList.filter((item: any) => {

      switch (this.searchType) {

        case 'empId':

          return item.empId
            ?.toString()
            .includes(text);

        case 'empName':

          return (item.empName || '')
            .toLowerCase()
            .includes(text);

        case 'serialNo':

          return (item.serialNo || '')
            .toLowerCase()
            .includes(text);

        case 'updatedDate':

          return (item.updatedDate || '')
            .toLowerCase()
            .includes(text);

        default:

          return true;

      }

    });

  }

  this.totalItems = this.filterallData.length;

  this.pageIndex = 0;

  this.applyPagination();

}

// =========================
// Pagination
// =========================

applyPagination() {

  const start = this.pageIndex * this.pageSize;

  const end = start + this.pageSize;

  this.dataSource.data = this.filterallData.slice(start, end);

}

pageChanged(event: any) {

  this.pageIndex = event.pageIndex;

  this.pageSize = event.pageSize;

  this.applyPagination();

}

// =========================
// Search Placeholder
// =========================

getPlaceholder() {

  switch (this.searchType) {

    case 'empId':
      return 'Search Employee ID';

    case 'empName':
      return 'Search Employee Name';

    case 'serialNo':
      return 'Search Serial No';

    case 'updatedDate':
      return 'Search Transfer Date';

    default:
      return 'Search';

  }

}

// =========================
// Dropdown Label
// =========================

getSelectLabel() {

  switch (this.searchType) {

    case 'activity':
      return 'Activity';

    case 'deviceName':
      return 'Device Name';

    case 'status':
      return 'Status';

    default:
      return 'Select';

  }

}

// =========================
// Search Box Filter
// =========================

applyFilter(event: any) {

  this.searchText = event.target.value;

  this.filterDatas();

}





}
