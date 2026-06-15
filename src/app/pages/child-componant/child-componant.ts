import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data-service';

@Component({
  selector: 'app-child-componant',
  imports: [],
  templateUrl: './child-componant.html',
  styleUrl: './child-componant.scss',
})
export class ChildComponant implements OnInit{
TodoAallData:any

constructor(private dataService:DataService){

}

ngOnInit(): void {
  console.log(this.TodoAallData)
}


}
