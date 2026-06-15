import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Device } from '../../dashboard/dashboard';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data-service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-log-records',
  imports: [SharedModule, CommonModule],
  templateUrl: './log-records.html',
  styleUrl: './log-records.scss',
})
export class LogRecords implements OnChanges{
 @Input() rowData: any;

 @Output() searchValue:any = new EventEmitter<any>()

  displayedColumns: string[] = [
  'id',
  'empId',
  'recordTime',
  'ioStatus',
  'deviceName',
];
    @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
dataSource:any = new MatTableDataSource<any>();
DeviceList: any[] = [];
  constructor(private fb:FormBuilder, private dataService:DataService, private sanitizer:DomSanitizer) {
   }

   ngOnChanges() {
console.log("row data", this.rowData)
   }

   filterData(event:any){
    const searchv = event.target.value;
     this.searchValue.emit(searchv)
   }

  ngOnInit(): void {
 
   this.getLogRecords(); 
}
getLogRecords() {
  this.dataService.getAllData('getAllLogs').subscribe(
    (data: any) => {
      this.DeviceList = data.extend.data || [];

      this.DeviceList.forEach((item: any) => {
        if (item.enrollId && item.imagePath) {
          item.img = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:image/jpg;base64,${item.imagePath}`
          );
        } else {
          item.img = null;
        }
      });

      this.dataSource.data = this.DeviceList;

      console.log('DeviceList:', this.DeviceList);
    },
    (error) => {
      console.error('Error fetching records:', error);
    }
  );
}


applyFilter(event: Event) {
  const input = event.target as HTMLInputElement;
  const filterValue = input.value.trim().toLowerCase();

  console.log('filterValue...', filterValue);
  console.log('Before filtering DeviceList:', this.DeviceList);

  if (!Array.isArray(this.DeviceList)) {
    console.error("DeviceList is not an array", this.DeviceList);
    return;
  }
  const filteredData = this.DeviceList.filter((item: any) =>
    item.deviceSerial?.toLowerCase().includes(filterValue)
  );

  this.dataSource.data = filteredData;
}


}
