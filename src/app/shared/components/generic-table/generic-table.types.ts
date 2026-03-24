import { TemplateRef } from '@angular/core';
import { SortDirection } from '../../types/shared.types';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  columnClass?: string;
  columnCellClass?: string;
  formatter?: (item: T) => string;
}
