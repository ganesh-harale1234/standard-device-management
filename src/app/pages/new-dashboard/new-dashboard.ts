import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Dashboard } from "../dashboard/dashboard";

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-new-dashboard',
  imports: [SharedModule, FormsModule, CommonModule, ],
  templateUrl: './new-dashboard.html',
  styleUrl: './new-dashboard.scss',
})
export class NewDashboard {

tableData = [
    { name: 'Ganesh Harale', age: 19, address: 'Pune' },
    { name: 'Rahul Patil', age: 22, address: 'Mumbai' },
    { name: 'Amit Deshmukh', age: 25, address: 'Nashik' },
    { name: 'Suresh Kale', age: 30, address: 'Kolhapur' },
    { name: 'Akash More', age: 21, address: 'Satara' },
    { name: 'Nilesh Patil', age: 24, address: 'Solapur' },
    { name: 'Omkar Pawar', age: 26, address: 'Pune' },
  ];
  

  displayedColumns: string[] = [ 'SRNO',  'name', 'weight', 'symbol'];

  filterDataUser:any[] = [];
  dataSource:any [] = []
user:any
  // Default → Real-time dashboard
  isRealtime: boolean = true;

  toggleDashboard() {
    this.isRealtime = !this.isRealtime;
  }

constructor(){
 
const result = this.tableData.find((item:any)=> item.name == "Rahul Patil");
console.log(result)

  this.filterDataUser = this.tableData;
  this.dataSource = this.filterDataUser;

}

punchingLogs = [
  { id: 23524, name: "Vikash Kumar Patel", time: "11:22:34 AM", zone: "Z3-UNO IN-1", status: "IN", color: "bg-yellow-100" },
  { id: 1814415, name: "Nandu Anantrao Kshatriya", time: "11:22:18 AM", zone: "Z3-UNO OUT-2", status: "OUT", color: "bg-yellow-100" },
  { id: 3151, name: "Shailesh Kumar Awachat", time: "11:22:08 AM", zone: "Z1-Green OUT-2", status: "OUT", color: "bg-green-200" },
  { id: 23524, name: "Vikash Kumar Patel", time: "11:22:34 AM", zone: "Z3-UNO IN-1", status: "IN", color: "bg-yellow-100" },
  { id: 1814415, name: "Nandu Anantrao Kshatriya", time: "11:22:18 AM", zone: "Z3-UNO OUT-2", status: "OUT", color: "bg-yellow-100" },
  { id: 3151, name: "Shailesh Kumar Awachat", time: "11:22:08 AM", zone: "Z1-Green OUT-2", status: "OUT", color: "bg-green-200" },
  { id: 1814415, name: "Nandu Anantrao Kshatriya", time: "11:22:18 AM", zone: "Z3-UNO OUT-2", status: "OUT", color: "bg-yellow-100" },
  { id: 1814415, name: "Nandu Anantrao Kshatriya", time: "11:22:18 AM", zone: "Z3-UNO OUT-2", status: "OUT", color: "bg-yellow-100" },
  { id: 1814415, name: "Nandu Anantrao Kshatriya", time: "11:22:18 AM", zone: "Z3-UNO OUT-2", status: "OUT", color: "bg-yellow-100" },
  { id: 1814415, name: "Nandu Anantrao Kshatriya", time: "11:22:18 AM", zone: "Z3-UNO OUT-2", status: "OUT", color: "bg-yellow-100" },

];

alarmLogs = [
  { id: 15765, name: "Ravindra Gaikwad", details: "Z1-WS Gate OUT-7 11:22 AM", color: "bg-red-100" },
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" }, 
    { id: 15765, name: "Ravindra Gaikwad", details: "Z1-WS Gate OUT-7 11:22 AM", color: "bg-red-100" },
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },

  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  

  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  
  { id: 99999999, name: "Stranger", details: "Z3-UNO OUT-1 11:20 AM", color: "bg-pink-200" },  

];

filterData(event: any) {
  const searchValue = event.target.value.trim().toLowerCase();
    this.filterDataUser = this.tableData.filter((item: any) =>
    item.name?.toLowerCase().includes(searchValue)
  );

  this.dataSource = this.filterDataUser;
}




}
