import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAnchor } from "@angular/material/button";
import { DataService } from '../../services/data-service';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { CdkNoDataRow } from "@angular/cdk/table";

interface student {
  id:number,
  name:string,
  address:string,
  co_number:number,
  department:string,
  birth_date:string,
  gender:string
}

@Component({
  selector: 'app-parentcomponant',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './parentcomponant.html',
  styleUrl: './parentcomponant.scss',
})
export class Parentcomponant {

  myForm!:FormGroup;
studentForm:FormGroup;
isEdited:any;
studentData:student[] = []

  constructor(private fb:FormBuilder, private dataService:DataService){
  this.studentForm = this.fb.group({
    name:['', [Validators.required]],
    address:['', Validators.required],
    department:['', Validators.required],
    birth_date:['', Validators.required],
    gender:['', Validators.required],
    co_number:['', Validators.required],

  })



  this.myForm = this.fb.group({
     title: ['', Validators.required],
     discription: ['', Validators.required],
     conNumber:['', [Validators.required, Validators.pattern(`^[0-9]{10}$`)] ]
  
  })
  }

  submit(){
  if(this.myForm.valid){
 const formData = {
  id:Date.now(),
  ...this.myForm.value
 }
 console.log(formData)

    console.log(this.myForm.value)

  }else{
    this.myForm.markAllAsTouched();
    alert("Please fill all required fields...!")
  }
  }


save(){
if(this.studentForm.valid){
  console.log("formvalue...", this.studentForm.value)

}else{
  this.studentForm.markAllAsTouched();
  alert("Please fill all required fileds..!")
}
}

update(){

}

delete(id:any){

}

edit(id:any){

}
  

}
