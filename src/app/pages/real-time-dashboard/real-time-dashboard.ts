import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Dashboard } from '../dashboard/dashboard';
import { DataService } from '../../services/data-service';
import { I } from '@angular/cdk/keycodes';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-real-time-dashboard',
  imports: [SharedModule, CommonModule, FormsModule,Dashboard ],
  templateUrl: './real-time-dashboard.html',
  styleUrl: './real-time-dashboard.scss',
})
export class RealTimeDashboard implements OnInit{

  isRealtime: boolean = true;

  toggleDashboard() {
    this.isRealtime = !this.isRealtime;
       this.dataService.setTitle('Real time Dashboard');
  }


 filterPunchingLog:any[] = [];
 filteralarmLogs:any[]= [];
 isEdit:boolean = false 
 totalCountLog:number = 0;
 totalCountAlarm:number = 0;

punchingLogs:any = [];
alarmLogs:any = [] =[];

constructor(private fb:FormBuilder, public dataService:DataService, private toaster:ToastrService){


}


ngOnInit(){
   
 this.getPunchinglog();
 this.getAlarmLogs()
this.dataService.setTitle('Real time Dashboard');


}

getPunchinglog(){
        console.log("Punching log fuction call...")
  this.dataService.getAllData(`todaysPunchLogs`).subscribe((res:any)=>{
    if(res.code == 100){
      console.log("Punching log", res)
   this.punchingLogs = res.extend.todaysPunchLogs
     this.filterPunchingLog = this.punchingLogs;
     this.totalCountLog = this.filterPunchingLog?.length;
    }else if(res.code == 200){
      // this.toaster.error(res.msg || "Data not found today...!")
    }
    
    else if(res.code == 500){
      this.toaster.error(res.msg || 'Internal server error... !')
    }else{
      this.toaster.error("Something went wrong...!")
    }
  })

}


getAlarmLogs(){
        console.log("Punching log fuction call...")
  this.dataService.getAllData(`todaysAlarmLogs`).subscribe((res:any)=>{
    if(res.code == 100){
      console.log("Punching log", res)
 
   this.alarmLogs = res.extend.todaysAlarmLogs
   console.log("alram", this.alarmLogs)
     this.filteralarmLogs = this.alarmLogs;
     this.totalCountAlarm = this.filteralarmLogs?.length;
    }else if(res.code == 200){
      // this.toaster.error(res.msg || "Data not found today...!")
    }
    
    else if(res.code == 500){
      this.toaster.error(res.msg || 'Internal server error... !')
    }else{
      this.toaster.error("Something went wrong...!")
    }
  })

}


filterDatapunchingLog(event: any) {
  const value = (event.target.value || '').trim().toLowerCase();
  console.log('search value......', value);
  this.filterPunchingLog = this.punchingLogs.filter((item: any) => {
    return item.name.toLowerCase().includes(value);   
  });
  console.log('filtered data.......', this.filterPunchingLog);
}


filterDatAlaram(event:any){
   const value = (event.target.value || '').trim().toLowerCase();
  console.log('search value......', value);
  this.filteralarmLogs = this.alarmLogs.filter((item: any) => {
    return item.name.toLowerCase().includes(value);   
  });

}



}
