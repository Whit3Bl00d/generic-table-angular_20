import { TemplateRef } from '@angular/core';

export interface TableColumn<T extends Record<string | number, any>> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableFilter<T extends Record<string | number, any>> {
  key: keyof T;
  value: string;
}

export interface TableSort<T extends Record<string | number, any>> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export type SortDirection = 'asc' | 'desc';
