import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-employee-transfer-data',
  imports: [SharedModule,MatFormFieldModule, MatInputModule,NgSelectModule, MatIconModule],
  templateUrl: './employee-transfer-data.html',
  styleUrl: './employee-transfer-data.scss',
})
export class EmployeeTransferData implements AfterViewInit {showFormData = false;
showTableData = true;

form: FormGroup;

// Device List
devicesList: any[] = [];

// Transfer Table Data
transferList: any[] = [];
filterallData: any[] = [];
pageIndex = 0;
pageSize = 100;

totalItems = 0;
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
  maxDate: string = new Date().toISOString().split('T')[0];

fromDateValue: string = new Date().toISOString().split('T')[0];

toDateValue: string = new Date().toISOString().split('T')[0];
constructor(
  private fb: FormBuilder,
  private dataService: DataService, private toastr:ToastrService, private spinner:NgxSpinnerService,
) {
  this.form = this.fb.group({});
}
locationID:any;
RoleName:any;
  ngOnInit(): void {
  this.locationID = sessionStorage.getItem('locationId');
  this.RoleName =  sessionStorage.getItem('roleName');

  this.getDeviceallList();

  this.getAllempTransferlList();

  this.getallData();

}

ngAfterViewInit(): void {
    this.applyPagination();

}


formatDateToYMD(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();

  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

AuditReport(): void {

  this.spinner.show();

  const fromDate =
    this.formatDateToYMD(this.fromDate);

  const toDate =
    this.formatDateToYMD(this.toDate);


  let apiUrl = '';


  if (
    this.RoleName === 'Branch Admin' &&
    this.locationID
  ) {

    apiUrl =
      `transferActivityTableDataByDateWise` +
      `?fromDate=${fromDate}` +
      `&toDate=${toDate}` +
      `&locationId=${this.locationID}`;

  } else {

    apiUrl =
      `transferActivityTableDataByDateWise` +
      `?fromDate=${fromDate}` +
      `&toDate=${toDate}`;
  }


  this.dataService
    .getAllData(apiUrl)
    .subscribe({

      next: (res: any) => {

        this.spinner.hide();

        // Full data
        this.transferList =
          res?.extend?.data || [];

        this.filterallData =
          [...this.transferList];

        this.totalItems =
          this.filterallData.length;

        this.pageIndex = 0;

        // Only first page render
        this.applyPagination();
      },


      error: () => {

        this.spinner.hide();

        this.toastr.error(
          'Unable to fetch data. Please try again later.'
        );

      }

    });
}
//================ Device ==================
getDeviceallList(): void {

  let apiUrl = '';

  if (
    this.RoleName === 'Branch Admin' &&
    this.locationID
  ) {

    apiUrl =
      `device?locationId=${this.locationID}`;

  } else {

    apiUrl = 'device';
  }


  this.dataService
    .getAllData(apiUrl)
    .subscribe({

      next: (res: any) => {

        this.devicesList = res || [];

      },

      error: () => {

        this.devicesList = [];

      }

    });
}

//================ Transfer Activity ==================

// getAllempTransferlList() {

//   this.spinner.show();

//   // this.dataService
//   //   .getAllData('transferActivityTableData')
//   //   .subscribe(
//   //     (res: any) => {

//   let apiUrl = '';

// if (this.RoleName === 'Branch Admin' && this.locationID) {
//   apiUrl = `transferActivityTableData?locationId=${this.locationID}`;
// } else {
//   apiUrl = 'transferActivityTableData';
// }

// this.dataService
//   .getAllData(apiUrl)
//   .subscribe((res: any) => {

//         this.spinner.hide();

//         this.transferList = res?.extend?.data || [];

//         this.filterallData = [...this.transferList];

//         this.applyPagination();

//       },
//       (error) => {

//         this.spinner.hide();

      
//         this.spinner.hide();

//            this.toastr.error(
//         'Unable to fetch data. Please try again later.'
//       );

      
//       }
//     );
// }





getAllempTransferlList() {

  this.spinner.show();

  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {

    apiUrl =
      `transferActivityTableData?locationId=${this.locationID}`;

  } else {

    apiUrl = 'transferActivityTableData';
  }

  this.dataService.getAllData(apiUrl).subscribe({

    next: (res: any) => {

      this.spinner.hide();

      // FULL DATA
      this.transferList = res?.extend?.data || [];

      // Search/filter sathi complete data
      this.filterallData = [...this.transferList];

      // Total records
      this.totalItems = this.filterallData.length;

      // First page
      this.pageIndex = 0;

      // ONLY 100 records table madhe render hotil
      this.applyPagination();

    },

    error: (error) => {

      this.spinner.hide();

      this.transferList = [];
      this.filterallData = [];

      this.totalItems = 0;

      this.applyPagination();

      this.toastr.error(
        'Unable to fetch data. Please try again later.'
      );
    }

  });
}


//================ Access Group ==================

getallData(): void {

  let apiUrl = '';

  if (
    this.RoleName === 'Branch Admin' &&
    this.locationID
  ) {

    apiUrl =
      `accessGroup/getAllAccessGroups?locationId=${this.locationID}`;

  } else {

    apiUrl =
      'accessGroup/getAllAccessGroups';
  }


  this.dataService
    .getAllData(apiUrl)
    .subscribe({

      next: (res: any) => {

        if (res?.code == 100) {

          this.accessGroupList =
            res?.extend?.data || [];

        } else {

          this.accessGroupList = [];
        }

      },

      error: () => {

        this.accessGroupList = [];

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

getFilterdatDevicewise(): void {

  const accessGroupIds =
    this.selectedAccessGroupIds.join(',');

  let apiUrl =
    `transferActivityTableData?accessGroupIds=${accessGroupIds}`;


  if (this.RoleName === 'Branch Admin' && this.locationID) {

    apiUrl +=
      `&locationId=${this.locationID}`;
  }


  this.spinner.show();

  this.dataService
    .getAllData(apiUrl)
    .subscribe({

      next: (res: any) => {

        this.spinner.hide();

        // Full filtered API data
        this.transferList =
          res?.extend?.data || [];

        this.filterallData =
          [...this.transferList];

        this.pageIndex = 0;

        this.applyPagination();
      },


      error: () => {

        this.spinner.hide();

        this.transferList = [];

        this.filterallData = [];

        this.totalItems = 0;

        this.applyPagination();

        this.toastr.error(
          'Unable to fetch data. Please try again later.'
        );
      }

    });
}



ExportTOExcel(): void {

  const excelData =
    this.transferList.map(
      (item: any, index: number) => ({

        'Sr No.':
          index + 1,

        'Biometric ID':
          item.empId ?? '',

        'Employee Name':
          item.empName ?? '',

        'Device Name':
          item.deviceName ?? '',

        'Transfer Date':
          item.updatedDate
            ? new Date(
                item.updatedDate
              ).toLocaleString(
                'en-GB',
                {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }
              )
            : '',

        'Access Group Name':
          item.accessGroup ?? '',

        'Activity':
          item.activity ?? '',

        'Status':
          item.status === 1 ||
          item.status === '1'
            ? 'Success'
            : item.status ?? ''

      })
    );


  const ws: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(
      excelData
    );


  const wb: XLSX.WorkBook =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    wb,
    ws,
    'Employee Transfer'
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

// pageIndex = 0;
// pageSize = 100;
// totalItems = 0;

// =========================
// Search Type Change
// =========================

onSearchTypeChange(): void {

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
          this.devicesList
            .map((x: any) => x.deviceName)
            .filter(Boolean)
        )
      ];

      break;


    case 'accessGroup':

      this.dropdownList = [
        ...new Set(
          this.accessGroupList
            .map((x: any) => x.accessGroupName)
            .filter(Boolean)
        )
      ];

      break;


    case 'status':

      this.dropdownList = [
        'Success',
        'Pending'
      ];

      break;


    default:

      this.dropdownList = [];

      break;
  }

  // IMPORTANT:
  // Full data reset
  this.filterallData = [...this.transferList];

  // First page
  this.pageIndex = 0;

  // Recalculate
  this.applyPagination();
}



// =========================
// Dropdown Filter
// =========================

filterDropdown(): void {

  // No selection
  if (!this.selectedValue) {

    this.filterallData = [
      ...this.transferList
    ];

  } else {

    // FULL DATA madhun filter
    this.filterallData =
      this.transferList.filter((item: any) => {

        switch (this.searchType) {

          // =====================
          // Activity
          // =====================

          case 'activity':

            return item.activity ===
              this.selectedValue;


          // =====================
          // Device
          // =====================

          case 'deviceName':

            return item.deviceName ===
              this.selectedValue;


          // =====================
          // Access Group
          // =====================

          case 'accessGroup':

            return item.accessGroup ===
              this.selectedValue;


          // =====================
          // Status
          // =====================

          case 'status':

            return (
              item.status == 1
                ? 'Success'
                : 'Pending'
            ) === this.selectedValue;


          default:

            return true;
        }

      });
  }


  // Total filtered records
  this.totalItems =
    this.filterallData.length;


  // First page
  this.pageIndex = 0;


  // Show current page only
  this.applyPagination();
}
// =========================
// Search Input
// =========================


onTransferDateChange(): void {

  if (!this.searchText) {

    this.filterallData = [
      ...this.transferList
    ];

  } else {

    const selectedDate = this.searchText;

    this.filterallData = this.transferList.filter((item: any) => {

      if (!item.updatedDate) {
        return false;
      }

      const itemDate = new Date(item.updatedDate);

      const year = itemDate.getFullYear();
      const month = String(itemDate.getMonth() + 1).padStart(2, '0');
      const day = String(itemDate.getDate()).padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;

      return formattedDate === selectedDate;
    });
  }

  // First page
  this.pageIndex = 0;

  // Apply pagination
  this.applyPagination();
}



onSearchInput(event: any) {

  let value = event.target.value;

  if (this.searchType == 'empId') {

    value = value.replace(/[^0-9]/g, '');

  }

  if (this.searchType == 'empName') {
  value = value.replace(/[^a-zA-Z ]/g, '');
}

  this.searchText = value;

  event.target.value = value;

  this.filterDatas();

}

// =========================
// Text Search
// =========================

filterDatas(): void {

  const text =
    this.searchText
      .trim()
      .toLowerCase();


  // =========================
  // Empty Search
  // =========================

  if (!text) {

    // Full 25k+ data
    this.filterallData = [
      ...this.transferList
    ];

  } else {

    // IMPORTANT:
    // Search FULL transferList madhun honar
    this.filterallData =
      this.transferList.filter((item: any) => {

        switch (this.searchType) {

          // =====================
          // Employee ID
          // =====================

          case 'empId':

            return item.empId
              ?.toString()
              .toLowerCase()
              .includes(text);


          // =====================
          // Employee Name
          // =====================

          case 'empName':

            return (
              item.empName || ''
            )
              .toString()
              .toLowerCase()
              .includes(text);


          // =====================
          // Serial Number
          // =====================

          case 'serialNo':

            return (
              item.serialNo || ''
            )
              .toString()
              .toLowerCase()
              .includes(text);


          // =====================
          // Transfer Date
          // =====================

          case 'updatedDate':

            return (
              item.updatedDate || ''
            )
              .toString()
              .toLowerCase()
              .includes(text);


          default:

            return true;
        }

      });
  }


  // Total filtered records
  this.totalItems =
    this.filterallData.length;


  // Search result always first page
  this.pageIndex = 0;


  // Show only current page
  this.applyPagination();
}

// =========================
// Pagination
// =========================

applyPagination(): void {

  // Total filtered records
  this.totalItems = this.filterallData.length;

  // Current page start
  const start = this.pageIndex * this.pageSize;

  // Current page end
  const end = start + this.pageSize;

  // Current page चे फक्त 100 records
  const currentPageData =
    this.filterallData.slice(start, end);

  // ⭐⭐⭐ हेच line इथे use करा
  this.dataSource.data = currentPageData;

  // Paginator update
  if (this.paginator) {

    this.paginator.length = this.totalItems;

    this.paginator.pageIndex = this.pageIndex;

    this.paginator.pageSize = this.pageSize;
  }
}

pageChanged(event: any): void {

  this.pageIndex = event.pageIndex;

  this.pageSize = event.pageSize;

  this.applyPagination();
}
// =========================
// Search Placeholder
// =========================

getPlaceholder(): string {

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

getSelectLabel(): string {

  switch (this.searchType) {

    case 'activity':
      return 'Activity';

    case 'deviceName':
      return 'Device Name';

    case 'accessGroup':
      return 'Access Group';

    case 'status':
      return 'Status';

    default:
      return 'Select';
  }
}
// =========================
// Search Box Filter
// =========================

applyFilter(event: any): void {

  this.searchText =
    event.target.value;

  this.filterDatas();
}




}
