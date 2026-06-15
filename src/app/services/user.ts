import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class User {
  mainUrl:any = environment.HostUrl
 constructor(private http:HttpClient, private router:Router){}

 private userNameSubject =  new BehaviorSubject<string |null > (null);
  $userName = this.userNameSubject.asObservable();


  setUser(user:any){
    this.userNameSubject.next(user)
  }


 userLogin<Observable>(data:any){
 const httpOption = {
  headers:new HttpHeaders({'Content-Type' : 'application/json'})
 }

   return this.http.post(`${this.mainUrl +'login'}`,data, httpOption)
 }

  // just example: check if token exists in localStorage
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    // return !!token; // true if token exists
    if (token) {
  return true;
} else {
  return false;
}

  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName')
    this.router.navigate(['/login'])
  }


}
