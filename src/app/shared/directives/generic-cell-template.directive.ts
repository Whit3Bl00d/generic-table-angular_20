import { Directive, Input, TemplateRef } from '@angular/core';
import { TableCellContext } from '../types/shared.types';

@Directive({
  selector: '[tableCell]',
  standalone: true
})
export class GenericCellTemplateDirective<T = any> {
  @Input('tableCell') name!: string;

  constructor(public template: TemplateRef<TableCellContext<T>>) {}

  /**
   * This "Guard" tells Angular: 
   * "Inside this template, the 'let-item' variable matches the type of my data."
   */
  static ngTemplateContextGuard<T>(
    dir: GenericCellTemplateDirective<T>,
    ctx: any
  ): ctx is TableCellContext<T> {
    return true; 
  }
}