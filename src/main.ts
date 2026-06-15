import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { interceptorInterceptor } from './app/auth/interceptor-interceptor';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([interceptorInterceptor])),

    importProvidersFrom(
      BrowserAnimationsModule,
      NgxSpinnerModule 
    ),

    //✅ standalone-style toastr config
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      newestOnTop: true,
      tapToDismiss: true,
    }),
  ],
}).catch((err) => console.error(err));
