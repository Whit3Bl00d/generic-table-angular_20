import { TemplateRef } from '@angular/core';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  columnClass?: string;
  columnCellClass?: string;
}

export interface TableFilter<T> {
  key: keyof T;
  value: string;
}

export interface TableSort<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export type SortDirection = 'asc' | 'desc';
