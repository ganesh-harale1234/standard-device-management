import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data-service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AddLocation } from "../master/add-location/add-location";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Parentcomponant } from "../parentcomponant/parentcomponant";

@Component({
  selector: 'app-person-tracking',
  imports: [SharedModule, CommonModule, FormsModule],
  templateUrl: './person-tracking.html',
  styleUrl: './person-tracking.scss',
})
export class PersonTracking  implements OnInit{

  userName:string = "Ganesh Harale" ;


searchText: string = '';

timeEvents:any[] = [];
trackingDetails:any

tracking: any;
photos:any;
toDate:Date = new Date;
fromDate:Date = new Date;
todayDate!:string;
private searchSubject = new Subject<string>();
countBehavior:any;
constructor(private dataService:DataService, private router:Router,private route:ActivatedRoute, private toater:ToastrService, private sanitizer:DomSanitizer){}

postdata:any
@ViewChild('searchInput') searchInput!: ElementRef;

ngAfterViewInit() {
  this.searchInput.nativeElement.focus();
}


ngOnInit() {

  this.searchSubject
    .pipe(
      debounceTime(400),       
      distinctUntilChanged()  
    )
    .subscribe(value => {
      this.empId = Number(value);
        this.getDetailPerson()

    });


}



empId!:any 

getempId(event: any) {
  // this.empId = event.target.value.toLowerCase().trim()
   this.empId = Number(event.target.value.trim())
    this.searchSubject.next(this.empId);
}


getDetailPerson(){
  this.timeEvents = [];
  this.trackingDetails = []
  this.dataService.getById(`tracking/${this.empId}`).subscribe((res:any)=>{
if(res.code==100){
    this.timeEvents = res.extend.data.timeline;
    this.trackingDetails = res.extend.data.trackingDetails

console.log(this.trackingDetails, 'tempdetails....')
}else if(res.code==200){
   this.toater.error(res.msg)
}
}

)}

}















