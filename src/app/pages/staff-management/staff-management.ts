import { Component, ElementRef, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../shared/shared-module';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../services/data-service';
// import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatOption, MatSelect } from '@angular/material/select';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import { NgxSpinner, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import {FaceDetector,FilesetResolver} from '@mediapipe/tasks-vision';
@Component({
  selector: 'app-staff-management',
  imports: [SharedModule, CommonModule,  FormsModule,NgSelectModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './staff-management.html',
  styleUrl: './staff-management.scss',
})
export class StaffManagement {

  showFormData:boolean = false;
  showTableData:boolean = true
  isEditMode:boolean = false;
  isChecked: boolean = true; 
getAllList:any = [];
filterallData:any = [];
empId:any;
getAllListlocation:any;
getAllListdepartment:any;
getAllListgroup:any;
getAllListcategory:any;
getAllListcontractor:any;
getAllListcompany:any
devicesListList:any = [];
imagePath:any;
getAllListRole:any;
locationID:any;
RoleName:any;
  // checkbox filters (header)
  showBiometricId = true;
  showSrNo = true;
  showName = true;
  showEmployeeId = true;
  showLevel = true;
  showstatus=true;
  // showPhoto = true;
  showEdit = true;
  empType: 'staff' | 'contractor' = 'staff';
  // columns
  displayedColumns: string[] = [
    'select',
    'Srno',
    'biometricId',
    'name',
    'accessGroup',
    // 'employeeId',
    'level',
    // 'empStatus',
    // 'photo',
    'edit'
  ];

MyArrayType: any[] = [
  { id: -1, text: 'name' },
  { id: 10, text: 'Password' },
  { id: 11, text: 'Card Number' },
  { id: 50, text: 'Photo' },
];

selectedIds: number[] = [];
isAllSelectedBackupNum = false;

// Select All toggle
toggleSelectAllBackupNum(): void {
  if (this.isAllSelectedBackupNum) {
    //  unselect
    this.selectedIds = [];
    this.isAllSelectedBackupNum = false;
  } else {
    //  ids select
    this.selectedIds = this.MyArrayType.map(x => x.id);
    this.isAllSelectedBackupNum = true;
  }

  // backup list update
  this.bacUpNumbersList = [...this.selectedIds];
  console.log('backup number (Select All):', this.bacUpNumbersList);
}

// Single item checkbox toggle
toggleSingleBackupNum(id: number, checked: boolean): void {
  if (checked) {
    if (!this.selectedIds.includes(id)) {
      this.selectedIds = [...this.selectedIds, id];
    }
  } else {
    this.selectedIds = this.selectedIds.filter(x => x !== id);
  }

  // Select All flag update
  const allIds = this.MyArrayType.map(x => x.id);
  this.isAllSelectedBackupNum = allIds.length > 0 && allIds.every(id =>
    this.selectedIds.includes(id)
  );

  // backup list update
  this.bacUpNumbersList = [...this.selectedIds];
  console.log('backup number (single):', this.bacUpNumbersList);
}

// mat-select selectionChange (optional – )
onSelectionChangeBackupNum(event: any): void {
  const selected = event.value as number[];
  this.selectedIds = selected;

  const allIds = this.MyArrayType.map(x => x.id);
  this.isAllSelectedBackupNum = allIds.length > 0 && allIds.every(id =>
    this.selectedIds.includes(id)
  );

  this.bacUpNumbersList = [...this.selectedIds];
  console.log('backup number (selectionChange):', this.bacUpNumbersList);
}




allSelected=false;
allSelected1=false;

  backupNumdata = new FormControl();




  // devicesList list
devicesList:any = [];

// selected device ids
selectedDeviceIds: string[] = [];

  // 🔹 Pagination + table data
  // dataSource = new MatTableDataSource([this.filterallData]);
  dataSource = new MatTableDataSource([]);

  @ViewChild('excelFileInput') excelFileInput!: ElementRef<HTMLInputElement>;
 showLoginFields = false;
  pageIndex = 0;
  pageSize = 10;                               // 5 per page
  pageStart = 0;
  pageEnd = 0;
  totalItems = 0;
 form!: FormGroup;
 @ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild('TABLE', { static: false }) table!: ElementRef;
@ViewChild('callAPIDialog') callAPIDialog!: TemplateRef<any>;
@ViewChild('uploadExcelDialog') uploadExcelDialog!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder, private toaster:ToastrService,private dialog: MatDialog,private elementRef: ElementRef,  private spinner:NgxSpinnerService, private toastr:ToastrService, private dataService:DataService, private sanitizer:DomSanitizer ) {
       this.form = this.fb.group({
      empId: ['', Validators.required],
      name: ['', Validators.required],
      userId: ['', Validators.required],
      // password:['', Validators.required],
      cardNum:['', ],
      locationId:[''],
      deptId:['',Validators.required ],
      accessGroupId:['',],
      categoryId:['', Validators.required],
      companyName:['', Validators.required],
      // joining_date:['' , Validators.required],
      empStatus:['' , Validators.required],
      roleName:['', Validators.required],
      desigId:['', Validators.required],
      // pnrNo:['',Validators.required],
      // backupNum: [],,
      // conId:['',],
       conId: [null],
          
       loginName: [''],
    loginPassword: [''],
      rollId: ['', Validators.required],
      // photoUrl: ['']   // default
    });
      this.updateContractorValidator();
  }


  onEmpTypeChange() {
    this.updateContractorValidator();
  }

setValu:boolean = true;

  updateLocationValidator(role: string) {
  const locationControl = this.form.get('locationId');

  if (role === 'Admin') {
    locationControl?.clearValidators();
    this.setValu = false;
  } else {
    locationControl?.setValidators([Validators.required]);
     this.setValu = true;
  }

  locationControl?.updateValueAndValidity();
}



  updateContractorValidator() {
    const conIdControl = this.form.get('conId');

    if (this.empType === 'contractor') {
      conIdControl?.setValidators([Validators.required]);
    } else {
      conIdControl?.clearValidators();
      conIdControl?.setValue(null);
    }

    conIdControl?.updateValueAndValidity();
  }
  setRoleValidation(role: string) {
  

  const userName = this.form.get('loginName');
  const password = this.form.get('loginPassword');

  if (role === 'Admin' || role === 'Branch Admin') {

    this.showLoginFields = true;

    userName?.setValidators([Validators.required]);
    password?.setValidators(  [
      Validators.required,
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
    ]);

  } else {

    this.showLoginFields = false;

    userName?.clearValidators();
    password?.clearValidators();

    userName?.reset();
    password?.reset();
  }

  userName?.updateValueAndValidity();
  password?.updateValueAndValidity();
}

addnew(){
 this.isEditMode = false;
  this.showFormData = true
  this.showTableData = false
  this.onCancel()
}

backtoList(){
    this.showFormData = false
  this.showTableData = true
}

selectedStatus: string = 'All';



changeStatus(status: string) {

  if (status === 'All') {
    this.getallData();
    return;
  }

  this.getStatuswiseEmp(status);
}
allEmpShow(){
  this.getallData();
}









// changeStatus(status: string) {
//   if (status === 'All') {
//     this.getallData();
//   } else {
//     this.getStatuswiseEmp(status);
//   }
// }

// employee/findAllEmployees?locationId

getStatuswiseEmp(empStatus:any){
  // this.dataService.getAllData(`employeeStatus?empStatus=${empStatus}`).subscribe((res:any)=>{

  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `employeeStatus?empStatus=${empStatus}&locationId=${this.locationID}`;
  } else {
    apiUrl = `employeeStatus?empStatus=${empStatus}`;
  }
    this.dataService.getAllData(apiUrl).subscribe((res: any) => {

       if (res.code === 100) {
        this.getAllList = (res?.extend?.data || []).map((item: any) => {

          if (item.photo === 'Y' && item.image) {

            // 🔥 remove unwanted prefix before /9j/
            const index = item.image.indexOf('/9j/');
            const cleanBase64 =
              index !== -1 ? item.image.substring(index) : item.image;

            return {
              ...item,
              img: this.sanitizer.bypassSecurityTrustResourceUrl(
                `data:image/jpeg;base64,${cleanBase64}`
              )
            };
          }

          return { ...item, img: null };
        });

        this.filterallData = this.getAllList;
        this.dataSource = new MatTableDataSource(this.getAllList);
        this.dataSource.paginator = this.paginator;
      }
  })
}
hidePassword = true;
userNameLogin:any;
  
  ngOnInit(): void {
    this.locationID = sessionStorage.getItem('locationId');
    this.RoleName =  sessionStorage.getItem('roleName');
    this.userNameLogin =  sessionStorage.getItem('userName');

    console.log(this.locationID, "location ID........") 
     this.form.get('roleName')?.valueChanges.subscribe((role) => {
    this.updateLocationValidator(role);
  });
//  this.changeStatus(this.isChecked)
  this.form.get('roleName')?.valueChanges.subscribe(role => {
    this.setRoleValidation(role);
  });

this.getallDataRole();
 this.getallData();
 this.getalllocation();
 this.getallDatadepartment();
 this.getallDatagroup();
 this.getallDatacaregory();
 this.getallDatacontactor();
 this.getallDatacompany();
 this.getDeviceallList();
 this.getallCollegeData();
 this.getallDiginationData();
   this.loadFaceDetector();
  }


getAllListDigination:any[] = []

  getallDiginationData(){
    this.dataService.getAllData('findAllDesignations').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllListDigination = res.extend.allDesignations;
            
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, ((err)=>{
    })
  )
  }

collegeList:any  = []
    getallCollegeData(){
    this.dataService.getAllData('getAllCollege').subscribe((res:any)=>{
      if(res.code === 100){
      this.collegeList = res.extend.allColleges;

      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, ((err)=>{
      const errorMsg = err.error.msg || 'Faild to load Department list !'
      this.toaster.error(errorMsg)
    })
  )
  }

   getDeviceallList(){
    this.dataService.getAllData('device').subscribe((res:any)=>{
      this.devicesList = res;
    })
   }
    getallDatacompany(){
    this.dataService.getAllData('getAllCompany').subscribe((res:any)=>{
      if(res.code === 100){
        this.getAllListcompany = res.extend.allCompany;
      }else{
        this.toaster.error('Data not found !')
      }
    }, )
  }
   
  getallDatacontactor(){
    this.dataService.getAllData('findAllcontractors').subscribe((res:any)=>{
      if(res.code === 100){
        this.getAllListcontractor = res.extend.allContractors;
        console.log('contractor list', this.getAllListcontractor)
      }else{
        this.toaster.error('Data not found !')
      }
    }, )
  }

    getallDatacaregory(){
    this.dataService.getAllData('getAllCategory').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllListcategory = res?.extend?.allCategory;
   
    this.applyPagination();
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, ((err)=>{
      const errorMsg = err.error.msg || 'Faild to load Category list !'
      // this.toaster.error(errorMsg)
    })
  )
  }

   getallDatagroup(){
    // this.dataService.getAllData('accessGroup/getAllAccessGroups').subscribe((res:any)=>{
  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `accessGroup/getAllAccessGroups?locationId=${this.locationID}`;
  } else {
    apiUrl = 'accessGroup/getAllAccessGroups';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any) => {

      if(res.code === 100){
      this.getAllListgroup = res.extend.data;
  
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, 
  )
  }

   getallDataRole(){
    this.dataService.getAllData('getAllRoleName').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllListRole = res.extend.RoleName;
  
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      // else{
      //   this.toaster.error('Something went wrong !')
      // }
    }, 
  )
  }

    getallDatadepartment(){
    this.dataService.getAllData('getAllDepartments').subscribe((res:any)=>{
      if(res.code === 100){
      this.getAllListdepartment = res.extend.allDepartments;
         
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, 
  )
  }

 getalllocation(){
    // this.dataService.getAllData('findAllLocation').subscribe((res:any)=>{

  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `findAllLocation?locationId=${this.locationID}`;
  } else {
    apiUrl = 'findAllLocation';
  }

  this.dataService.getAllData(apiUrl).subscribe((res: any) => {
      if(res.code === 100){
      this.getAllListlocation = res.extend.data;
       
      }else if(res.code===500){
                this.toaster.error('Internal server error !')
      }
      else{
        this.toaster.error('Something went wrong !')
      }
    }, )
  
  }


    //  "locationId": 4,
    //   "name": "Sagar",
    //    "roleName": "Branch Admin",


getallData() {
    // this.spinner.show()
  let apiUrl = '';

  if (this.RoleName === 'Branch Admin' && this.locationID) {
    apiUrl = `employee/findAllEmployees?locationId=${this.locationID}`;
  } else {
    apiUrl = 'employee/findAllEmployees';
  }

  this.dataService.getAllData(apiUrl).subscribe(
    (res: any) => {
        this.spinner.hide()

      if (res.code === 100) {

        this.getAllList = (res?.extend?.data || []).map((item: any) => {

          if (item.photo === 'Y' && item.image) {

            // 🔥 remove unwanted prefix before /9j/
            const index = item.image.indexOf('/9j/');
            const cleanBase64 =
              index !== -1 ? item.image.substring(index) : item.image;

            return {
              ...item,
              img: this.sanitizer.bypassSecurityTrustResourceUrl(
                `data:image/jpeg;base64,${cleanBase64}`
              )
            };
          }

          return { ...item, img: null };
        });

        this.filterallData = this.getAllList;
        this.dataSource = new MatTableDataSource(this.getAllList);
        this.dataSource.paginator = this.paginator;
      }
    }
  );
}



// getallData() {
// //  this.spinner.show();
//   this.dataService.getAllData('employee/findAllEmployees').subscribe(
//     (res: any) => {
//       // this.spinner.hide();
//       if (res.code === 100) {
//         this.getAllList = res?.extend?.data || [];
//                this.filterallData = this.getAllList;
//               this.dataSource = new MatTableDataSource(this.getAllList);
//       this.dataSource.paginator = this.paginator;
//         this.getAllList.forEach((item: any) => {
//           if (item.photo === 'Y' && item.image) {
//             const imgsrc = item.image; 

//             item.img = this.sanitizer.bypassSecurityTrustResourceUrl(
//               `data:image/jpeg;base64,${imgsrc}`
//             );
//           } else {
//             item.img = null;
//           }
//         });

//       } else if (res.code === 500) {
//         this.toaster.error('Internal server error !');
//       } else {
//         this.toaster.error('Something went wrong !');
//       }
//     },
//     (err) => {
//       const errorMsg = err?.error?.msg || 'Faild to load employee list !';
//       this.toaster.error(errorMsg);
//     }
//   );
// }


// Camera references
@ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

isCameraOn = false;
stream: MediaStream | null = null;

// Final image preview (Base64 string - DataURL)
photoPreview: any | null = null;

photoFile: File | null = null;



private faceDetector!: FaceDetector;
private detectorLoaded = false;

// ---------- FILE FROM GALLERY ----------
// onFileSelected(event: Event): void {
//   const input = event.target as HTMLInputElement;
//   if (!input.files || input.files.length === 0) {
//     return;
//   }

//   const file = input.files[0];

//   if (!file.type.startsWith('image/')) {
//     alert('Please select an image file.');
//     return;
//   }

//   this.photoFile = file;

//   const reader = new FileReader();
//   reader.onload = () => {
//     this.photoPreview = reader.result as string;

//     // ---- CONSOLE LOGS ----
//     console.log('File Selected - DataURL (with prefix):', this.photoPreview);

//     const pureBase64 = this.photoPreview.split(',')[1];
//      this.imagePath = pureBase64;
//     console.log('File Selected - Pure Base64 (without prefix):', pureBase64);
//     // ----------------------
//   };
//   reader.readAsDataURL(file);

//   this.form.patchValue({ photo: file });
//   this.form.get('photo')?.markAsDirty();
//   this.form.get('photo')?.updateValueAndValidity();
// }

async onFileSelected(event: Event): Promise<void> {

  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];

  if (!file.type.startsWith('image/')) {

    this.toastr.error('Please select an image.');

    input.value = '';

    return;

  }

  if (!this.detectorLoaded) {

    this.toastr.error('Face detector is loading.');

    return;

  }

  const isHuman = await this.validateHumanFace(file);

  if (!isHuman) {

    this.photoFile = null;
    this.photoPreview = null;
    this.imagePath = '';

    this.form.patchValue({
      photo: null
    });

    input.value = '';

    this.toastr.error('Only human face images are allowed.');

    return;

  }

  this.photoFile = file;

  const reader = new FileReader();

  reader.onload = () => {

    this.photoPreview = reader.result as string;

    const pureBase64 =
      this.photoPreview.split(',')[1];

    this.imagePath = pureBase64;

  };

  reader.readAsDataURL(file);

  this.form.patchValue({
    photo: file
  });

  this.form.get('photo')?.markAsDirty();
  this.form.get('photo')?.updateValueAndValidity();

  this.toastr.success('Human face detected successfully.');

}


async loadFaceDetector() {

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  this.faceDetector = await FaceDetector.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite'
      },
      runningMode: 'IMAGE'
    }
  );

  this.detectorLoaded = true;

}

async validateHumanFace(file: File): Promise<boolean> {

  return new Promise((resolve) => {

    const img = new Image();

    img.onload = async () => {

      try {

        const result = this.faceDetector.detect(img);

        resolve(result.detections.length > 0);

      } catch {

        resolve(false);

      }

    };

    img.src = URL.createObjectURL(file);

  });

}

// ---------- OPEN CAMERA ----------
async openCamera(): Promise<void> {
  try {
    if (this.stream) {
      this.closeCamera();
    }

    // Camera access
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }, 
      audio: false,
    });

    this.isCameraOn = true;

    setTimeout(() => {
      if (this.videoRef && this.videoRef.nativeElement) {
        this.videoRef.nativeElement.srcObject = this.stream;
      }
    });
  } catch (err) {
    console.error('Error accessing camera:', err);
    alert('Unable to access camera. Please allow camera permission.');
  }
}


capturePhoto(): void {
  if (!this.videoRef || !this.videoRef.nativeElement) {
    return;
  }

  const video = this.videoRef.nativeElement;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 480;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg');
  this.photoPreview = dataUrl;

  // ---- CONSOLE LOGS ----
  console.log('Camera Capture - DataURL (with prefix):', this.photoPreview);

  const pureBase64 = this.photoPreview.split(',')[1];
  this.imagePath = pureBase64
  console.log('Camera Capture - Pure Base64 (without prefix):', pureBase64);
  // ----------------------

  canvas.toBlob(
    (blob) => {
      if (!blob) return;

      const file = new File([blob], 'captured-photo.jpg', {
        type: 'image/jpeg',
      });

      this.photoFile = file;

      this.form.patchValue({ photo: file });
      this.form.get('photo')?.markAsDirty();
      this.form.get('photo')?.updateValueAndValidity();
    },
    'image/jpeg',
    0.9
  );
}


// ---------- CLOSE CAMERA ----------
closeCamera(): void {
  this.isCameraOn = false;

  if (this.stream) {
    this.stream.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  if (this.videoRef && this.videoRef.nativeElement) {
    this.videoRef.nativeElement.srcObject = null;
  }
}


// ---------- PHOTO REQUIRED ERROR () ----------
get photoRequiredError(): any {
  return (
    this.form.get('photo')?.hasError('required') &&
    (this.form.get('photo')?.touched || this.form.get('photo')?.dirty)
  );
}





  // ---------- FORM SUBMIT (JSON + Base64) ----------
  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.toaster.error('Please fill all required fields!');
      return;
    }
      var formValue = this.form.value

    const body = {
      ...this.form.value,
      empType:this.empType,
      //  accessGroupId: formValue.accessGroupId.join(','),
      imagePath: this.imagePath,
    };

    this.dataService.addDataC('employee/addEmployee', body).subscribe(
      (res: any) => {
        if (res.code === 100) {
          this.toaster.success(res.msg || 'Employee add sucessfully !');
          this.form.reset();
          this.photoFile = null;
          this.photoPreview = null;
          this.filterallData = [...this.getAllList];
          this.totalItems = this.filterallData.length;
          this.pageIndex = 0;
          this.applyPagination();
          this.getallData();
          this.backtoList()
        } else if (res.code === 200) {
          this.toaster.error( res.msg ||'Data allready exits..!');
        } else {
          this.toaster.error('Something went wrong !');
        }
      },
      (err: any) => {
        const errorMsg = err?.error?.msg || 'Server side error !';
        this.toaster.error(errorMsg);
      }
    );
  }



// editData(id: any) {
//   this.empId = id;
//   this.showFormData = true;
//   this.showTableData = false;
//   this.isEditMode = true;

//   if (id) {
//     this.dataService
//       .getById('employee/findEmployeeByUserId?enrollId=' + id)
//       .subscribe(
//         (res: any) => {
//         if (res.code === 100) {
//   const empData = res.extend.data[0];

//   this.empType = empData.conId ? 'contractor' : 'staff';

//   this.form.patchValue({
//     enrollId: empData.enrollId,
//     deptId: empData.deptId,
//     name: empData.name,
//     companyName: empData.companyName,
//     rollId: empData.rollId,
//     categoryId: empData.categoryId,
//     locationId: empData.locationId,
//     userId: empData.userId,
//     conId: empData.conId,   
//     groupId: empData.groupId,
//     imagePath: empData.imagePath,
//     cardNum: empData.cardNum,
//     password: empData.password || ''
//   });
// } else {
//             this.toaster.error('No Data found!');
//           }
//         },
//         (err: any) => {
//           const errMsg = err?.error?.msg || 'Something went wrong!';
//           this.toaster.error(errMsg);
//         }
//       );
//   }
// }


editData(id: any) {
  this.updateContractorValidator()
  this.empId = id;
  this.showFormData = true;
  this.showTableData = false;
  this.isEditMode = true;

  if (id) {
    this.dataService
      .getById('employee/findEmployeeByUserId?enrollId=' + id)
      .subscribe(
        (res: any) => {
          if (res.code === 100) {

            const empData = res.extend.data[0];
           this.setRoleValidation(empData.roleName);
                      this.updateLocationValidator(empData.roleName);


            // Employee type
            // this.empType = empData.empType ;
            this.empType =
  empData.empType?.toLowerCase() === 'contractor'
    ? 'contractor'
    : 'staff';
// "empType": "staff",

const ids = empData.accessGroupId
  ? empData.accessGroupId
      .split(',')
      .map((x: string) => Number(x.trim()))
  : [];

console.log(ids); // [1,2,1011]
            this.form.patchValue({
              userId: empData.userId,
              deptId: empData.deptId,
              name: empData.name,
              companyName: empData.companyName,
              rollId: empData.rollId,
              categoryId: empData.categoryId,
              locationId: empData.locationId,
              empId: empData.empId,
              conId: empData.conId,
              loginName:empData.loginName,
                            loginPassword:empData.loginPassword,

             
              // accessGroupId: empData.accessGroupId,
                // accessGroupId: Number(empData.accessGroupId),
              cardNum: empData.cardNum,
              //joining_date: empData.groupId,
              empStatus: empData.empStatus,
              roleName:empData.roleName,
              // "roleName": "Admin",
                            desigId:empData.desigId,

              // password: empData.password || '',
             accessGroupId: ids
           });
          // this.form.get('accessGroupId')?.disable();

            if (empData.photo === 'Y' && empData.image) {
              this.photoPreview =
                this.sanitizer.bypassSecurityTrustResourceUrl(
                  'data:image/jpeg;base64,' + empData.image
                );
            } else {
              this.photoPreview = null;
            }

          } else {
            this.toaster.error('No Data found!');
          }
        },
        (err: any) => {
          const errMsg = err?.error?.msg || 'Something went wrong!';
          this.toaster.error(errMsg);
        }
      );
  }
}


onUpdate(){
  if(this.form.valid){
     const formValues = this.form.value
    const fromData = {
     enrollId:this.empId,
      ...this.form.value,
       empType:this.empType,
        accessGroupId: formValues.accessGroupId.join(','),
      imagePath: this.imagePath, 
    }
    this.dataService.updateDataC('employee/updateEmployee',fromData).subscribe((res:any)=>{
      if(res.code == 100){
        this.toaster.success(res.msg || 'Category Data Update Sucessfully !');
              this.photoFile = null;
          this.photoPreview = null;
        this.getallData();
        this.form.reset();
        this.backtoList()
        this.isEditMode = false;

      }else{
        this.toaster.error('Something went wrong !')
      }
    },((err:any)=>{
      if(err?.error?.msg){
            this.toaster.error( err.error.msg,'error!')
      }else{
                    this.toaster.error('Server side error !')
      }
    })
  )
  }else{
    this.form.markAllAsTouched();
    this.toaster.error('Please fill all required fields!')
  }
}

// delete(id:any){
//   const enrollId = id;
// this.dataService.deleteData('deleteCategoryById/'+ enrollId).subscribe((res:any)=>{
//   if(res.code === 100){
//  this.toaster.success(res.msg || 'Data deleted successfully !')
//   this.getallData();

//   }else if(res.code === 500){
//     this.toaster.error('Internal Server Error !')
//   }else{
//     this.toaster.error('Something went wrong !')
//   }

// },((err:any)=>{
//          const errorMessage = err?.error?.message || 'Something went wrong!';
//          this.toaster.error(errorMessage)
// })

// )
// }



  // 🔹 pagination logic
  applyPagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    // this.dataSource.data = this.getAllList.slice(start, end);
        this.dataSource.data = this.filterallData.slice(start, end);
    this.pageStart = this.totalItems ? start + 1 : 0;
    this.pageEnd = Math.min(end, this.totalItems);
  }

  nextPage(): void {
    if ((this.pageIndex + 1) * this.pageSize < this.totalItems) {
      this.pageIndex++;
      this.applyPagination();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.applyPagination();
    }
  }



  isDropdownOpen = false;

  @ViewChild('dropdown') dropdown!: ElementRef;

  ngAfterViewInit() {
    // ViewChild initialized here
      this.dataSource.paginator = this.paginator;
  }

  columns = [
    { key: 'biometricId', label: 'Biometric ID', checked: true },
    { key: 'name', label: 'Name', checked: true },
    // { key: 'employeeId', label: 'Employee ID', checked: true },
    { key: 'level', label: 'Level', checked: true },
    { key: 'photo', label: 'Photo', checked: true },
    { key: 'edit', label: 'Edit', checked: true }
  ];

  openDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = true;
  }

  // ✅ SAFE outside click
  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.isDropdownOpen &&
      this.dropdown &&
      !this.dropdown.nativeElement.contains(event.target)
    ) {
      this.isDropdownOpen = false;
    }
  }

  updateColumns() {
    this.showBiometricId = this.columns.find(c => c.key === 'biometricId')?.checked ?? false;
    this.showName = this.columns.find(c => c.key === 'name')?.checked ?? false;
    // this.showEmployeeId = this.columns.find(c => c.key === 'employeeId')?.checked ?? false;
    this.showLevel = this.columns.find(c => c.key === 'level')?.checked ?? false;
    // this.showPhoto = this.columns.find(c => c.key === 'photo')?.checked ?? false;
    this.showEdit = this.columns.find(c => c.key === 'edit')?.checked ?? false;
  }

onColumnChange(event: Event) {
  const selected = Array.from(
    (event.target as HTMLSelectElement).selectedOptions
  ).map(opt => opt.value);

  this.showBiometricId = selected.includes('biometricId');
  this.showName = selected.includes('name');
  // this.showEmployeeId = selected.includes('employeeId');
  this.showLevel = selected.includes('level');
  // this.showPhoto = selected.includes('photo');
  this.showEdit = selected.includes('edit');
}

  // 🔹 dynamic visible columns based on header checkboxes
  get visibleColumns(): string[] {
    const cols: string[] = ['select'];
    if (this.showSrNo) cols.push('Srno');
    if (this.showBiometricId) cols.push('biometricId');
    if (this.showName) cols.push('name');
    // if (this.showEmployeeId) cols.push('employeeId');

    // cols.push('backupNum');

    if (this.showLevel) cols.push('level');
        // if (this.showstatus) cols.push('empStatus');

    
    // if (this.showPhoto) cols.push('photo');
    if (this.showEdit) cols.push('edit');

    return cols;
  }

  deleteSelected() {
    this.getAllList = this.getAllList.filter((e:any) => !e.select);

    this.getAllList = [...this.getAllList];
    this.totalItems = this.getAllList.length;

    const maxPageIndex = Math.floor((this.totalItems - 1) / this.pageSize);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = Math.max(0, maxPageIndex);
    }
    this.applyPagination();
  }

  uploadToDevice() {
    console.log('Upload to device clicked');
  }

  exportToExcel() {
    console.log('Export to excel clicked');
  }




deviceSerialNumList: string[] = [];

// Check if all devices are selected
// get isAllSelected(): boolean {
//   return this.devicesList.length > 0 &&
//          this.selectedDeviceIds.length === this.devicesList.length;
// }

// Check individual device selection
isSelected(serialNum: string): boolean {
  return this.selectedDeviceIds.includes(serialNum);
}

// Toggle single device
toggleDevice(serialNum: string, event: any): void {
  const checked = event.checked;

  if (checked) {
    if (!this.selectedDeviceIds.includes(serialNum)) {
      this.selectedDeviceIds = [...this.selectedDeviceIds, serialNum];
    }
  } else {
    this.selectedDeviceIds = this.selectedDeviceIds.filter(d => d !== serialNum);
  }

  this.deviceSerialNumList = [...this.selectedDeviceIds];
  console.log("Selected Serial Numbers:", this.selectedDeviceIds);
}
get isAllSelected(): boolean {
  return (
    (this.getAllListgroup?.length ?? 0) > 0 &&
    (this.selectedDeviceIds?.length ?? 0) ===
      (this.getAllListgroup?.length ?? 0)
  );
}
// Toggle Select All
toggleSelectAll(event: any): void {
  const checked = event.checked;

  if (checked) {
    this.selectedDeviceIds = this.getAllListgroup.map((d: any) => d.accessGroupId);
  } else {
    this.selectedDeviceIds = [];
  }

  this.deviceSerialNumList = [...this.selectedDeviceIds];
  console.log("Select All → ", this.selectedDeviceIds);
}

// Get device name from serial number
getDeviceName(serialNum: string): string {
  const dev = this.getAllListgroup.find((d: any) => d.accessGroupId === serialNum);
  return dev ? dev.accessGroupName : serialNum;
}


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is inside the dropdown or the main button
    const clickedInside = target.closest('.delete-menu-wrapper');

    if (!clickedInside) {
      this.showDeleteMenu = false;
    }
  }

showDeleteMenu = false;

  // Toggle dropdown
  toggleDeleteMenu(): void {
    this.showDeleteMenu = !this.showDeleteMenu;
    console.log("DELETE CALL......")
  }

  // Close dropdown (if you want to call it from outside also)
  closeDeleteMenu(): void {
    this.showDeleteMenu = false;
  }

  // Option 1: Delete all devicesList
  onDeleteAlldevicesList(): void {
    this.closeDeleteMenu();

    if (!confirm('Are you sure you want to delete ALL devicesList?')) {
      return;
    }


  }




  // Option 2: Delete devicesList emp-wise
  onDeleteEmpWise(): void {
    this.closeDeleteMenu();

  
  }
 
OpenUploadSelectedUserModal(){
  this.dialog.open(this.callAPIDialog, { height: '40%', width: '70%'})

    // this.  .open(this.callAPIDialog, { height: '30%', width: '40%'})
    }
 
    openUploadExcelDialog(): void {
  this.dialog.open(this.uploadExcelDialog, {
    width: '50%',
    height: '55%'
  });
}

  onCancel(): void {
        this.isEditMode = false;
    this.form.reset({
      biometricId: null,
      name: '',
      employeeId: '',
      // backupNum: '',
      level: '',
      photoUrl: ''
    });
  }










@ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

profileImage: any = null;
selectedFile: File | null = null;

removeImage() {
  this.photoFile = null;
  this.photoPreview = '';
  this.imagePath = '';

  this.form.patchValue({
    photo: null
  });

  this.form.get('photo')?.markAsPristine();
  this.form.get('photo')?.markAsUntouched();
  this.form.get('photo')?.updateValueAndValidity();

  this.fileInput.nativeElement.value = '';
}









isAllSelectedemp = false;
selectedEnrollIds: number[] = [];
selectedRolesText: string = '';  

enrollIdList:any[]=[];
userName:any;
bacUpNumbersList:any



// // ✅ Select All
// toggleSelectAllemp(event: any): void {
//   this.isAllSelectedemp = event.checked;

//   const rows = Array.isArray(this.dataSource)
//     ? this.dataSource
//     : this.dataSource.data;

//   this.selectedEnrollIds = [];       

//   const roles: string[] = [];

//   rows.forEach((row: any) => {
//     row.select = this.isAllSelectedemp;

//     if (this.isAllSelectedemp) {
//       // 
//       if (row.enrollId != null && row.enrollId !== undefined) {
//         this.selectedEnrollIds.push(row.enrollId);
//       }

//       if (row.rollId === 1) {
//         roles.push('Admin');
//       } else if (row.rollId === 0) {
//         roles.push('User');
//       }
//     }
//   });

//   this.selectedRolesText = roles.join(',');

//   console.log('Selected enrollIds (ALL):', this.selectedEnrollIds);
//   this.enrollIdList = this.selectedEnrollIds
//   console.log('Selected roles text (ALL):', this.selectedRolesText);
// }

toggleSelectAllemp(event: any): void {
  this.isAllSelectedemp = event.checked;

  const allRows = this.dataSource.data;

  // Current page records
  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;

  const currentPageRows = allRows.slice(startIndex, endIndex);

  this.selectedEnrollIds = [];
  const roles: string[] = [];

  currentPageRows.forEach((row: any) => {
    row.select = this.isAllSelectedemp;

    if (this.isAllSelectedemp) {

      this.selectedEnrollIds.push(row.enrollId);

      if (row.rollId === 1) {
        roles.push('Admin');
      } else {
        roles.push('User');
      }
    }
  });

  this.enrollIdList = [...this.selectedEnrollIds];
  this.selectedRolesText = roles.join(',');

  console.log(this.enrollIdList);
}

// onPageChange(event: PageEvent) {
//   this.pageIndex = event.pageIndex;
//   this.pageSize = event.pageSize;

//   this.isAllSelectedemp = false;
// }

// onPageChange(event: PageEvent) {

//   const pageSizeChanged = this.pageSize !== event.pageSize;

//   this.pageIndex = event.pageIndex;
//   this.pageSize = event.pageSize;

//   if (pageSizeChanged) {

//     this.isAllSelectedemp = false;

//     this.selectedEnrollIds = [];
//     this.enrollIdList = [];
//     this.selectedRolesText = '';

//     this.dataSource.data.forEach((row: any) => {
//       row.select = false;
//     });
//   }
// }



onPageChange(event: PageEvent) {

  const pageChanged = this.pageIndex !== event.pageIndex;
  const pageSizeChanged = this.pageSize !== event.pageSize;

  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;

  if (pageChanged || pageSizeChanged) {

    this.isAllSelectedemp = false;

    this.selectedEnrollIds = [];
    this.enrollIdList = [];
    this.selectedRolesText = '';

    this.dataSource.data.forEach((row: any) => {
      row.select = false;
    });
  }

  // Pagination data load असेल तर
  // this.loadEmployees();
}

// onPageChange(event: PageEvent): void {
//  this.currentPage = event.pageIndex;
//  this.pageSize = event.pageSize;
  
//   this.isAllSelectedemp = false;
//   this.selectedEnrollIds = [];
//   this.enrollIdList = [];
//   this.selectedRolesText = '';

//   const rows = this.dataSource.data;

//   rows.forEach((row: any) => row.select = false);
// }

// ✅ Individual row
onRowSelectionChange(row: any): void {
  const rows = Array.isArray(this.dataSource)
    ? this.dataSource
    : this.dataSource.data;

  if (row.select) {
    if (
      row.enrollId != null &&
      !this.selectedEnrollIds.includes(row.enrollId)
    ) {
      this.selectedEnrollIds.push(row.enrollId);
    }
  } else {
    this.selectedEnrollIds = this.selectedEnrollIds.filter(
      (id) => id !== row.enrollId
    );
  }

  const roles: string[] = [];
  rows.forEach((r: any) => {
    if (r.select) {
      if (r.rollId === 1) {
        roles.push('Admin');
      } else if (r.rollId === 0) {
        roles.push('User');
      }
    }
  });

  this.selectedRolesText = roles.join(',');

  this.isAllSelectedemp = rows.length > 0 && rows.every((r: any) => r.select);

  console.log('Selected enrollIds (ROW):', this.selectedEnrollIds);
  this.enrollIdList = this.selectedEnrollIds

  console.log('Selected roles text (ROW):', this.selectedRolesText);
}


// Uploade to Device select user divice...

// uploadSelctedUserToDevice() {
//   // 1 Employee  (selectedEnrollIds)
//   if (!this.selectedEnrollIds || this.selectedEnrollIds.length === 0) {
//     alert("You must select at least 1 employee to upload.");
//     return;
//   }

//   //  enrollIdList check
//   if (!this.enrollIdList || this.enrollIdList.length === 0) {
//     this.toastr.error("Enroll ID list is empty. Please select at least 1 employee.");
//     return;
//   }

//   //  Backup numbers list check
//   // if (!this.bacUpNumbersList || this.bacUpNumbersList.length === 0) {
//   //   this.toastr.error("Backup number not selected. Please select at least 1 backup number.");
//   //   return;
//   // }

//   //  Device serial list check
//   if (!this.deviceSerialNumList || this.deviceSerialNumList.length === 0) {
//     this.toastr.error("Device not selected. Please select at least one device.");
//     return;
//   }

//   //  UserName / Roles check
//   if (!this.selectedRolesText || this.selectedRolesText.length === 0) {
//     this.toastr.error("Role / user type not selected.");
//     return;
//   }

//   //  Confirm
//   const ok = confirm("Are you sure you want to upload selected employee(s) to device?");
//   if (!ok) {
//     return;
//   }

//   const enrollIdListParam = Array.isArray(this.enrollIdList)
//     ? [...this.enrollIdList]
//     : this.enrollIdList;

//   const backupNumbersParam = Array.isArray(this.bacUpNumbersList)
//     ? [...this.bacUpNumbersList]
//     : this.bacUpNumbersList;

//   const deviceSerialParam = Array.isArray(this.deviceSerialNumList)
//     ? [...this.deviceSerialNumList]
//     : this.deviceSerialNumList;

//   const userNameParam = Array.isArray(this.selectedRolesText)
//     ? this.selectedRolesText.join(',')
//     : this.selectedRolesText;

//   const form: any = {
//     enrollIdList: enrollIdListParam,
//     // bacUpNumbersList: backupNumbersParam,
//     deviceSerialNumList: deviceSerialParam,
//     userName: userNameParam,
//   };

//   //  API call
//   this.spinner.show()
//   this.dataService.addData('setOneUser', form).subscribe({
//     next: (response: any) => {
//        this.spinner.hide()
//       if (response.code === 100) {
//          this.spinner.hide()
//         this.toastr.success(response.msgs || 'Employees uploaded to device successfully.');
//         this.getallData();
//       }else if(response.code===500){
//          this.spinner.hide()
//         this.toaster.error(response.msg || 'Internal Server Error !')
//       } else {
//          this.spinner.hide()
//         this.toastr.error(response.msg || 'Failed to upload employees to device.');
//       }
//     },
//     error: (err: any) => {
//        this.spinner.hide()
//       console.error(err);
//       this.toastr.error('Server error while uploading employees to device.');
//     },
//   });
// }


 


uploadSelctedUserToDevice() {
  // 1 Employee  (selectedEnrollIds)
  if (!this.selectedEnrollIds || this.selectedEnrollIds.length === 0) {
    alert("You must select at least 1 employee to upload.");
    return;
  }

  //  enrollIdList check
  if (!this.enrollIdList || this.enrollIdList.length === 0) {
    this.toastr.error("Enroll ID list is empty. Please select at least 1 employee.");
    return;
  }

  //  Backup numbers list check
  // if (!this.bacUpNumbersList || this.bacUpNumbersList.length === 0) {
  //   this.toastr.error("Backup number not selected. Please select at least 1 backup number.");
  //   return;
  // }

  //  Device serial list check
  if (!this.deviceSerialNumList || this.deviceSerialNumList.length === 0) {
    this.toastr.error("Access Group not selected. Please select at least one Access Group.");
    return;
  }

  //  UserName / Roles check
  if (!this.selectedRolesText || this.selectedRolesText.length === 0) {
    this.toastr.error("Role / user type not selected.");
    return;
  }

  //  Confirm
  const ok = confirm("Are you sure you want to upload selected employee(s) to access group?");
  if (!ok) {
    return;
  }

  const enrollIdListParam = Array.isArray(this.enrollIdList)
    ? [...this.enrollIdList]
    : this.enrollIdList;

  const backupNumbersParam = Array.isArray(this.bacUpNumbersList)
    ? [...this.bacUpNumbersList]
    : this.bacUpNumbersList;

  const deviceSerialParam = Array.isArray(this.deviceSerialNumList)
    ? [...this.deviceSerialNumList]
    : this.deviceSerialNumList;

  const userNameParam = Array.isArray(this.selectedRolesText)
    ? this.selectedRolesText.join(',')
    : this.selectedRolesText;

  const form: any = {
    enrollIdList: enrollIdListParam,
    // bacUpNumbersList: backupNumbersParam,
    accessGroupId: deviceSerialParam,
    // userName: userNameParam,
  //     "accessGroupId": [1, 2],
  // "enrollIdList": [1,2]
  };

  //  API call
  this.spinner.show()
  this.dataService.addDataC('command/setUserToDevice', form).subscribe({
    next: (response: any) => {
       this.spinner.hide()
      if (response.code === 100) {
         this.spinner.hide()
        this.toastr.success(response.msgs || 'Employees uploaded to device successfully.');
        this.enrollIdList = []


    this.isAllSelectedemp = false;

    this.selectedEnrollIds = [];
    this.enrollIdList = [];
    this.selectedRolesText = '';

    this.dataSource.data.forEach((row: any) => {
      row.select = false;
    });


        this.getallData();
      }else if(response.code===500){
         this.spinner.hide()
        this.toaster.error(response.msg || 'Internal Server Error !')
      } else {
         this.spinner.hide()
        this.toastr.error(response.msg || 'Failed to upload employees to device.');
      }
    },
    error: (err: any) => {
       this.spinner.hide()
      console.error(err);
      this.toastr.error('Server error while uploading employees to device.');
    },
  });
}

//   Delete Employee software wise....


// emponDeleteSoftware() {
//   // if (!confirm('Are you sure you want to delete ALL devicesList?')) {
//   //     return;
//   //   }


//   if (this.selectedRolesText && this.selectedRolesText.length > 0) {
//     if (confirm("Are you sure Delete selected employee to Software？")) {
//       if (this.selectedRolesText == undefined) {
//         this.toastr.error("Device not selected please select atleast one device..!");
//       } else {
//         // const form: any = {
//         //   enrollId:this.enrollIdList,  
//         //   userName: this.selectedRolesText   
//         // };
//         this.dataService.deleteData(`empDeleteFromSoftware?enrollId=${this.enrollIdList}&userName=${this.selectedRolesText}`).subscribe((response:any) => {
//           if (response.code == 100) {
//             this.toastr.success(response.msd || 'Employee delete successfully from Software. !');
//             this.enrollIdList = '',
//             this.selectedRolesText = ''
//              this.getallData();

//           } else {
//             this.toastr.error(response.msg);
//           }
//         });
//       }
//     }
//   } else {
//     alert("you must select atleast 1 employee to Delete");
//   }
// }

emponDeleteSoftware() {

  if (!this.selectedRolesText || this.selectedRolesText.length === 0) {
    this.toastr.error("Please select at least one employee!");
    return;
  }

  if (!confirm("Are you sure you want to delete selected employee(s) from Software?")) {
    return;
  }

  // ✅ Store current selection locally
  const enrollIds = this.enrollIdList;
  const userNames = this.selectedRolesText;
// empDeleteFromSoftware?enrollId=7&userName=Patil 
  this.dataService
    .deleteData(
      `empDeleteFromSoftware?enrollId=${enrollIds}&userName=${this.userNameLogin}`
    )
    .subscribe(
      (response: any) => {

        if (response.code === 100) {
          this.toastr.success(
            response.mss || 'Employee deleted successfully from Software!'
          );

        this.enrollIdList.length = 0;
           this.selectedRolesText = '';

               this.getallData();

        } else {
          this.toastr.error(response.msg || 'Delete failed');
        }
      },
      (error) => {
        this.toastr.error('Something went wrong!');
        console.error(error);
      }
    );
}



// delete emp device...
emponDeleteDevices() {
  if (!this.selectedRolesText || this.selectedRolesText.length === 0) {
    alert("You must select at least 1 employee.");
    return; 
  }

  //  Device select
  if (!this.deviceSerialNumList || this.deviceSerialNumList.length === 0) {
    this.toastr.error("You must select at least 1 Access group.");
    return;
  }

  //  enrollIdList 
  if (!this.enrollIdList || this.enrollIdList.length === 0) {
    this.toastr.error("EnrollId not found. Please select at least 1 employee/device.");
    return;
  }

  // confirm 
  const ok = confirm("Are you sure you want to delete selected employee from Device?");
  if (!ok) {
    return;
  }

  // selectedRolesText / enrollIdList / deviceSerialNumList array 
  const userNameParam = Array.isArray(this.selectedRolesText)
    ? this.selectedRolesText.join(',')
    : this.selectedRolesText;

  const enrollIdParam = Array.isArray(this.enrollIdList)
    ? this.enrollIdList.join(',')
    : this.enrollIdList;

  const deviceSnParam = Array.isArray(this.deviceSerialNumList)
    ? this.deviceSerialNumList.join(',')
    : this.deviceSerialNumList;

  //  API call
  this.dataService
    .getAllData(

      `deletePersonFromAccessGroup?enrollIds=${enrollIdParam}&accessGroupIds=${deviceSnParam}&userName=${this.userNameLogin}`
    )
    .subscribe({
      next: (response: any) => {
        if (response.code === 100) {
          this.toastr.success(response.msd || 'Employees deleted successfully. !');
          this.getallData();
        } else {
          this.toastr.error(response.msg || 'Something went wrong.');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Server error while deleting employee from software.');
      },
    });
}







//     onPageChange(event: PageEvent) {
//   this.pageIndex = event.pageIndex;
//   this.pageSize = event.pageSize;
// }



ExportTOExcel()
{
   const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
 
  /* save to file */
  XLSX.writeFile(wb, 'User Details.xlsx');
 
}




  // Upload button click
  openFilePicker(): void {
    this.excelFileInput.nativeElement.value = ''; 
    this.excelFileInput.nativeElement.click();
  }

selectedExcelFile: File | null = null;

onExcelFileSelected(event: any): void {
  const file = event.target.files[0];

  if (file) {
    this.selectedExcelFile = file;
  }
}

uploadExcelFile(): void {

  if (!this.selectedExcelFile) {
    this.toastr.warning('Please select an Excel file.');
    return;
  }

  // Existing API Method Call
  this.uploadExcelToDevice(this.selectedExcelFile);
}


// uploadExcelToDevice(file: File): void {
//   console.log('Excel upload function call...');

//   const formData = new FormData();
//   formData.append('file', file);

//   this.dataService.addData('employee/uploadExcel', formData).subscribe({
//     next: (response: any) => {

//       // Check if validation messages are returned
//       if (response.extend?.messages?.length > 0) {
//         response.extend.messages.forEach((msg: string) => {
//           this.toastr.error(msg);
//         });
//         return;
//       }

//       // Success
//       if (response.code === 100) {
//         this.toastr.success(response.msg || 'Excel uploaded successfully.');
//         this.getallData();
//       }
//       // Server Error
//       else if (response.code === 500) {
//         this.toastr.error(response.msg || 'Internal Server Error!');
//       }
//       // Other Error
//       else {
//         this.toastr.error(response.msg || 'Failed to upload Excel.');
//       }
//     },

//     error: (err: any) => {
//       console.error(err);
//       this.toastr.error('Server error while uploading Excel file.');
//     }
//   });
// }










uploadExcelToDevice(file: File): void {

  const formData = new FormData();
  formData.append('file', file);

  this.spinner.show();

  this.dataService.addData('employee/importExcel', formData).subscribe({
    next: (response: any) => {

      this.spinner.hide();

      if (response.extend?.messages?.length > 0) {

        response.extend.messages.forEach((msg: string) => {

          if (
            msg.toLowerCase().includes('required') ||
            msg.toLowerCase().includes('invalid') ||
            msg.toLowerCase().includes('already') ||
            msg.toLowerCase().includes('failed')
          ) {
            this.toastr.error(msg);
          } else {
            this.toastr.success(msg);
          }

        });

        if (response.code === 100) {
          this.getallData();
          this.selectedExcelFile = null;
        }

        return;
      }

      if (response.code === 100) {
        this.toastr.success(response.msg || 'Excel uploaded successfully.');
        this.getallData();
        this.selectedExcelFile = null;
      } else {
        this.toastr.error(response.msg || 'Upload failed.');
      }

    },

    error: (err: any) => {

      this.spinner.hide();
      console.error(err);
      this.toastr.error('Server error while uploading Excel file.');

    }

  });

}











// searchType: string = 'name';

applyFilter(event: any) {

  const value = (event.target.value || '').trim().toLowerCase();

  this.filterallData = this.getAllList.filter((emp: any) => {

    let searchValue = '';

    switch (this.searchType) {
      case 'accessGroupName':
        searchValue = (emp.accessGroupName || '').toString().toLowerCase();
        break;

   case 'name':
        searchValue = (emp.name || '').toString().toLowerCase();
        break;

      case 'deptName':
        searchValue = (emp.deptName || '').toString().toLowerCase();
        break;

            case 'conName':
        searchValue = (emp.conName || '').toString().toLowerCase();
        break;

             case 'categoryName':
        searchValue = (emp.categoryName || '').toString().toLowerCase();
        break;

       

    

      // case 'empType':
      //   searchValue = (emp.empType || '').toString().toLowerCase();
      //   break;


      case 'userId':
        searchValue = (emp.userId || '').toString().toLowerCase();
        break;

      case 'empStatus':
        searchValue = (emp.empStatus || '').toString().toLowerCase();
        break;

      default:
        searchValue = (emp.name || '').toString().toLowerCase();
        break;
    }

    return searchValue.includes(value);

  });

  this.totalItems = this.filterallData.length;
  this.pageIndex = 0;
  this.applyPagination();
}



searchType: string = 'name';

selectedValue: string = '';

dropdownList: any[] = [];


onSearchTypeChange() {

  this.selectedValue = '';

  switch (this.searchType) {

    case 'deptName':
      this.dropdownList = this.getAllListdepartment.map((x:any) => x.deptName);
      break;

    case 'accessGroupName':
      this.dropdownList = this.getAllListgroup.map((x:any) => x.accessGroupName);
      break;

    case 'categoryName':
      this.dropdownList = this.getAllListcategory.map((x:any) => x.categoryName);
      break;

case 'contractorName':
  this.dropdownList = this.getAllListcontractor.map(
    (x: any) => x.contractorName
  );
  break;
    default:
      this.dropdownList = [];
      break;

  }

  this.filterallData = [...this.getAllList];

  this.totalItems = this.filterallData.length;
  this.pageIndex = 0;
  this.applyPagination();

}


filterDropdown() {

  if (!this.selectedValue) {
    this.filterallData = [...this.getAllList];
  } else {

    this.filterallData = this.getAllList.filter((emp: any) => {

      switch (this.searchType) {

        case 'deptName':
          return emp.deptName === this.selectedValue;

        case 'categoryName':
          return emp.categoryName === this.selectedValue;

    case 'contractorName':
  return emp.contractorName === this.selectedValue;

        case 'accessGroupName':

          return (emp.accessGroupName || '')
            .toLowerCase()
            .split(',')
            .map((x: string) => x.trim())
            .includes(this.selectedValue.toLowerCase());

        default:
          return true;

      }

    });

  }

  this.totalItems = this.filterallData.length;
  this.pageIndex = 0;
  this.applyPagination();

}

searchText: string = '';

onSearchInput(event: any) {

  let value = event.target.value;

  // Employee Name / Status => Only Characters
  if (this.searchType === 'name' || this.searchType === 'empStatus') {
    value = value.replace(/[^a-zA-Z\s]/g, '');
  }

  // BioID => Only Numbers
  else if (this.searchType === 'userId') {
    value = value.replace(/[^0-9]/g, '');
  }

  this.searchText = value;
  event.target.value = value;

  this.filterData();
}




filterData() {

  this.filterallData = this.getAllList.filter((emp: any) => {

    switch (this.searchType) {

      case 'name':
        return emp.name?.toLowerCase().includes(this.searchText.toLowerCase());

      case 'empStatus':
        return emp.empStatus?.toLowerCase().includes(this.searchText.toLowerCase());

      case 'userId':
        return emp.userId?.toString().includes(this.searchText);

      default:
        return true;
    }

  });

  this.totalItems = this.filterallData.length;
  this.pageIndex = 0;
  this.applyPagination();
}


actionType = 'transfer';
empTransfer() {
  console.log('Transfer');
}

empDelete() {
  console.log('Delete');
}


getSelectLabel(): string {
  switch (this.searchType) {
    case 'deptName':
      return 'Department';

    case 'accessGroupName':
      return 'Access Group';

    case 'categoryName':
      return 'Category';

    case 'contractorName':
      return 'Contractor';

    default:
      return '';
  }
}

getPlaceholder(): string {
  switch (this.searchType) {
    case 'userId':
      return 'Search Biometric ID';
    case 'name':
      return 'Search Employee Name';
    case 'empStatus':
            return 'Search Status';

     
    default:
      return 'Search here...';
  }
}


onAccessGroupChange(): void {
  const selected = this.form.get('accessGroupId')?.value || [];
  console.log('Selected Access Groups:', selected);
}


isAllAccessGroupSelected(): boolean {
  const selected = this.form.get('accessGroupId')?.value || [];

  return (
    this.getAllListgroup.length > 0 &&
    selected.length === this.getAllListgroup.length
  );
}
toggleSelectAllAccessGroups(): void {
  if (this.isAllAccessGroupSelected()) {
    this.form.get('accessGroupId')?.setValue([]);
  } else {
    const allIds = this.getAllListgroup.map(
      (item: any) => item.accessGroupId
    );

    this.form.get('accessGroupId')?.setValue(allIds);
  }
}


onlyNum(event:any){
  event.target.value = event.target.value.replace(/[^0-9]/gi, "")
}


}