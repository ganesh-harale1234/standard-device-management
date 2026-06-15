import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService  {

  baseUrl:any = environment.HostUrl; 



  constructor(private http:HttpClient){

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

getAllData(url:any): Observable<any>{
  const fullUrl = this.baseUrl+url;
  return this.http.get(`${fullUrl}`)
}

getById(url:any): Observable<any> {
  const fullUrl = this.baseUrl+url;
  return this.http.get(fullUrl)
}

updateData(url:any,data:any):Observable<any>{
  const fullUrl = this.baseUrl+url
  return this.http.put(fullUrl, data)
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

  saveRolePermissions(payload: any) {
    return this.http.post(`${this.baseUrl}/save`, payload);
  }

  getRolePermissions(role: string) {
    return this.http.get(`${this.baseUrl}/${role}`);
  }

}
