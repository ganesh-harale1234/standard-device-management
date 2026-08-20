import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService  {

  baseUrl:any = environment.HostUrl; 
userName:any;
  constructor(private http:HttpClient){
this.userName =  sessionStorage.getItem('userName');

  }

  private titleSubject = new BehaviorSubject<string>('Real Time Dashboard');

  title$ = this.titleSubject.asObservable();

  setTitle(title: string) {
    this.titleSubject.next(title);
  }

   // Add Post Data
 addData(url: string, data: any) :Observable<any>{
  const fullUrl = this.baseUrl + url;  
  return this.http.post(fullUrl, data); 
}

viewmasterReportDetails(requestData: any): Observable<any> {
  const fullUrl = `${this.baseUrl}masterReport`;
  return this.http.post(fullUrl, requestData);
}  

viewattendanceReportDetails(requestData: any): Observable<any> {
  const fullUrl = `${this.baseUrl}getAttendanceReport`;
  return this.http.post(fullUrl, requestData);
}   

viewAcumulateReportDetails(requestData: any): Observable<any> {
  const fullUrl = `${this.baseUrl}cumulativeReport`;

  const params = {
    fromDate: requestData.fromDate,
    toDate: requestData.toDate
  };

  return this.http.get(fullUrl, { params });
}

viewmultiplePunchesReportDetails(requestData: any): Observable<any> {
  const fullUrl = `${this.baseUrl}getEmpWiseMultiplePunchReport`;
  return this.http.post(fullUrl, requestData);
}   

addDataC(url: string, data: any): Observable<any> {
  return this.http.post(
    this.baseUrl + url + '?userName=' + this.userName,
    data
  );
}

getAllData(url:any): Observable<any>{
  const fullUrl = this.baseUrl+url;
  return this.http.get(`${fullUrl}`)
}

getById(url:any): Observable<any> {
  const fullUrl = this.baseUrl+url;
  return this.http.get(fullUrl)
}


getByIdC(url:any): Observable<any> {
  const fullUrl = this.baseUrl+url;
  return this.http.get(fullUrl)
}

updateData(url:any,data:any):Observable<any>{
  const fullUrl = this.baseUrl+url
  return this.http.put(fullUrl, data)
}


updateDataC(url:any,data:any):Observable<any>{
  return this.http.put(
    this.baseUrl + url + '?userName=' + this.userName,
    data
  );
}


// deleteData(id:any, url:any){
//   const fullUrl = this.baseUrl+url;
//   return this.http.delete(fullUrl,id)
// }

// deleteData(url: string,id: any,):Observable<any> {
//   const fullUrl = `${this.baseUrl}${url}/${id}`;  
//   return this.http.delete(fullUrl);
// }

deleteData(url: string) {
  const fullUrl = this.baseUrl + url;
  return this.http.delete(fullUrl);
}

deleteDataC(url: string) {
  return this.http.delete(
    this.baseUrl + url + '?userName=' + this.userName
  );
}


//  return this.http.post(
//     this.baseUrl + url + '?userName=' + this.userName,
//     data
//   );
  saveRolePermissions(payload: any) {
    return this.http.post(`${this.baseUrl}/save`, payload);
  }

  getRolePermissions(role: string) {
    return this.http.get(`${this.baseUrl}/${role}`);
  }

}
