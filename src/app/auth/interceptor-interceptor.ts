import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../services/user'; 

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const userService = inject(User);  
  const token = localStorage.getItem('token'); 
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // console.log(' Outgoing request:', authReq.url, authReq);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.warn(' Unauthorized/Forbidden, logging out...');
        userService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};






















// const NO_AUTH_URLS: string[] = [
//   '/login',
//   '/register',
//   '/send-otp',
//   '/verify-otp',
//   '/forgot-password'
// ];

// export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
//   const userService = inject(User);
//   const token = localStorage.getItem('token');

//   const isPublicApi = NO_AUTH_URLS.some(url => 
//     req.url.includes(url)
//   );

//   if (isPublicApi) {
//     return next(req); // 🔹 token skip
//   }

//   if (token) {
//     req = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//   }

//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401 || error.status === 403) {
//         userService.logout();
//         router.navigate(['/login']);
//       }
//       return throwError(() => error);
//     })
//   );
// };
