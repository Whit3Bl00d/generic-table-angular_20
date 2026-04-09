import { TemplateRef } from '@angular/core';
import { SortDirection } from '../../types/shared.types';
import { SelectionModel } from '@angular/cdk/collections';

export enum ColumnTypes {
  TEXT = 'text',

  ROW_NUMBERS = 'rowNumbers',

  CHECKBOX = 'checkbox',

  DATE = 'date',

  CUSTOM = 'custom',
}

interface TextColumnType<T> {
  type: ColumnTypes.TEXT | ColumnTypes.DATE;
  key: keyof T;
  formatter?: (item: T) => string;
};

interface NumberColumnType {
  type: ColumnTypes.ROW_NUMBERS;
};

interface CheckboxColumnType<T> {
  type: ColumnTypes.CHECKBOX;
  selectionModel: SelectionModel<T>;
};

interface CustomColumnType<T> {
  type: ColumnTypes.CUSTOM;
  key: keyof T;
  templateName: string;
};

export type ColumnType<T> =
  | TextColumnType<T>
  | NumberColumnType
  | CheckboxColumnType<T>
  | CustomColumnType<T>;

export interface TableColumn<T> {
  id: string; // Unique identifier for the column
  columnType: ColumnType<T>;
  label: string;
  sortable?: boolean;
  columnClass?: string;
  columnCellClass?: string;
}
export class TablecolumnBuilder<T> implements TableColumn<T> {
  id: string;
  columnType: ColumnType<T>;
  label: string;
  sortable?: boolean;
  columnClass?: string;
  columnCellClass?: string;

  constructor(props: TableColumn<T>) {
    this.id = props.id;
    this.columnType = props.columnType;
    this.label = props.label;
    this.sortable = props.sortable;
    this.columnClass = props.columnClass;
    this.columnCellClass = props.columnCellClass;
  }

  copy(
    newId: string,
    changes: {
      newLabel?: string;
      newSortable?: boolean;
      newColumnClass?: string;
      newColumnCellClass?: string;
    },
  ): TablecolumnBuilder<T> {
    return new TablecolumnBuilder<T>({
      ...this,
      id: newId,
      label: changes.newLabel || this.label,
      sortable: changes.newSortable ?? this.sortable,
      columnClass: changes.newColumnClass || this.columnClass,
      columnCellClass: changes.newColumnCellClass || this.columnCellClass,
    });
  }
}
