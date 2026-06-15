import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatPaginatorModule } from '@angular/material/paginator';

const MAT_MODULES = [

  MatToolbarModule,
  MatSidenavModule,
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  MatSelectModule,
  MatChipsModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatDialogModule,
  MatCheckboxModule,
  MatRadioModule,
  MatListModule,
  MatTableModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatStepperModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatDividerModule,
  MatTabsModule,
  MatExpansionModule,
  MatPaginatorModule,
  MatOption,
  MatSelect,
  MatButtonModule,
  FormsModule,
  CommonModule,
  // MatButtonToggleModule
]

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MAT_MODULES

  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MAT_MODULES,

  ]
})
export class SharedModule { }
