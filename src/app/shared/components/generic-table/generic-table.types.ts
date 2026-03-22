import { TemplateRef } from '@angular/core';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  columnClass?: string;
  columnCellClass?: string;
  formatter?: (item: T) => string;
}

export interface TableSort<T> {
  key: keyof T;
  direction: SortDirection;
}

export enum SortDirection {
  ascending = 'asc',
  descending = 'desc',
}
