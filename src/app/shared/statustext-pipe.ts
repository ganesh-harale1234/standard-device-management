import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statustext'
})
export class StatustextPipe implements PipeTransform {

  transform(value:any){
    return value == 1 || value == '1' ? 'Online' : 'Offline'
  }

}
