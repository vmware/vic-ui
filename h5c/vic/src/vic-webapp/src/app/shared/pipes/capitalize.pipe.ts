import {Pipe, PipeTransform} from '@angular/core';

/**
 * Transforms any string to a capitalized string.
 * e.g "this is the tile" -> "This is the title"
 */

@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform {

  transform(value:any) {
    if (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  }

}
