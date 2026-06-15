import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../services/data-service';
import { SharedModule } from '../../shared/shared-module';

@Component({
  selector: 'app-get-details',
  imports: [SharedModule,MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './get-details.html',
  styleUrl: './get-details.scss',
})
export class GetDetails {

showFormData:boolean = false
showTableData:boolean = true
form:FormGroup;
 totalCount:any
  // devices list
devicesList:any = [];

displayedColumns: string[] = [
  'id',
  'serialNum',
  'area',
  'deviceName',
  'fingerprint',
  'face',
  'card',
  'password'

];
empTransferAllList:any = [];
dataSource:any = new MatTableDataSource<any>([]);
filterData: any[] = [];

@ViewChild('TABLE', { static: false }) table!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private fb:FormBuilder, private dataService:DataService) {
    this.form = this.fb.group(({

    }))
   }

  ngOnInit(): void {
    this.getDeviceallList();
    //  this.getAllempTransferlList()
    
  }

     getDeviceallList(){
    this.dataService.getAllData('device').subscribe((res:any)=>{
      this.devicesList = res;
    })
   }

  //    getAllempTransferlList(){
  //   this.dataService.getAllData('getAllTransferedDataToDevice').subscribe((res:any)=>{
  //       const list = res?.extend?.list || [];

  //     this.filterData = list;              
  //     this.dataSource.data = list;           
  //     this.dataSource.paginator = this.paginator; 
  //   })
  //  }

    backtoList(){
    this.showFormData = false
  this.showTableData = true
}


selectedDeviceIds: number[] = [];
selectedDeviceSerialNums: string[] = [];


get isAllSelected(): boolean {
  return (
    this.selectedDeviceIds.length === this.devicesList.length &&
    this.devicesList.length > 0
  );
}
isSelected(id:any): boolean {
  return this.selectedDeviceIds.includes(id);
}

toggleDevice(id: number, event: any): void {
  const checked = event.checked;
  const device = this.devicesList.find((d: any) => d.id === id);

  if (!device) return;

  if (checked) {
    if (!this.selectedDeviceIds.includes(id)) {
      this.selectedDeviceIds.push(id);
      this.selectedDeviceSerialNums.push(device.serialNum);
    }
  } else {
    this.selectedDeviceIds =
      this.selectedDeviceIds.filter(d => d !== id);

    this.selectedDeviceSerialNums =
      this.selectedDeviceSerialNums.filter(
        s => s !== device.serialNum
      );
  }

 
  console.log('IDs:', this.selectedDeviceIds);
  console.log('Serials:', this.selectedDeviceSerialNums);

  //API CALL
  this.getFilterdatDevicewise();
}


toggleSelectAll(event: any): void {
  const checked = event.checked;

  if (checked) {
    this.selectedDeviceIds =
      this.devicesList.map((d: any) => d.id);

    this.selectedDeviceSerialNums =
      this.devicesList.map((d: any) => d.serialNum);
  } else {
    this.selectedDeviceIds = [];
    this.selectedDeviceSerialNums = [];
  }

  console.log('IDs:', this.selectedDeviceIds);
  console.log('Serials:', this.selectedDeviceSerialNums);

  this.getFilterdatDevicewise();
}


getDeviceName(id: number): string {
  const dev = this.devicesList.find((d:any) => d.id === id);
  return dev ? dev.deviceName : '';
}


getFilterdatDevicewise() {
  if (this.selectedDeviceSerialNums.length === 0) {
    this.empTransferAllList = [];
    this.dataSource = [];
    return;
  }

  const deviceList = this.selectedDeviceSerialNums.join(',');

  console.log('API PARAM:', deviceList);

  this.dataService
    .getAllData(
      'getPersonalDetails?deviceList=' + deviceList
    )
    .subscribe((res: any) => {

       const list = res;
      this.filterData = list; 
      this.totalCount = this.filterData.length ;           
      this.dataSource.data = list;           
      this.dataSource.paginator = this.paginator; 
      
    });
}


applyFilter(event: any) {
  const search = event.target.value.toLowerCase().trim();
  console.log('SearchValue...', search);

  if (!search) {
    this.dataSource = [...this.filterData]; 
    return;
  }

  this.dataSource = this.filterData.filter((item: any) =>
    item.employeeName?.toLowerCase().includes(search) ||
    item.employeeId?.toString().toLowerCase().includes(search)

  );
}


ExportTOExcel()
{
   const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  /* save to file */
  XLSX.writeFile(wb, 'Personal Details.xlsx');
 
}
}
