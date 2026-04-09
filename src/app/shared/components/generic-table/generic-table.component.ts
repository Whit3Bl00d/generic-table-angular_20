import {
  Component,
  input,
  computed,
  signal,
  output,
  effect,
  untracked,
  ChangeDetectionStrategy,
  TemplateRef,
  contentChildren,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { TableColumn, ColumnTypes } from './generic-table.types';
import { SortDirection, SortParams } from '../../types/shared.types';
import { GenericCellTemplateDirective } from '../../directives/generic-cell-template.directive';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatIconModule, MatButtonModule],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericTableComponent<T extends Record<string | number, any>> {
  // Constants
  private readonly SCROLL_THRESHOLD = 50; // Distance from bottom in pixels
  private isScrollLoading = false;
  ColumnTypes = ColumnTypes;

  // Inputs
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  emptyTemplate = input<TemplateRef<any> | undefined>(undefined);
  showSort = input<boolean>(true);
  showSortShowcase = input<boolean>(false);
  showRowNumbers = input<boolean>(false);
  rowNumberLabel = input<string>('#');
  selectionModel = input<SelectionModel<T> | undefined>(undefined);
  maxDataCount = input<number>(0);

  // Outputs
  rowClick = output<T>();
  scrollEnd = output<void>();
  sortChange = output<SortParams<T> | undefined>();

  constructor() {
    effect(() => {
      this.data(); // Track the data signal

      // Use untracked so we don't create a dependency on the boolean
      untracked(() => {
        this.isScrollLoading = false;
      });
    });

    effect(() => {
      this.sortChange.emit(this.sortSignal());
    });
  }

  // Private signals
  private sortSignal = signal<SortParams<T> | undefined>(undefined);

  private readonly templateRefs = contentChildren(GenericCellTemplateDirective);

  // Computed properties
  readonly hasMoreData = computed(() => {
    return this.data().length < this.maxDataCount();
  });

  readonly displayData = computed(() => {
    const data = this.data();

    if (!this.showRowNumbers()) {
      return data;
    }

    return data.map((item, index) => ({
      ...item,
      rowNumber: (index + 1).toString(),
    }));
  });

  readonly displayColumns = computed(() => {
    const columns = this.columns();
    const result: TableColumn<any>[] = [...columns];

    // Add checkbox column at start if selection model is provided via input
    // This ensures checkboxes appear as leftmost column regardless of existing columns
    if (this.selectionModel()) {
      const inputCheckboxColumn: TableColumn<any> = {
        id: 'generic-checkbox',
        label: '',
        sortable: false,
        columnClass: 'generic-table__col--checkbox',
        columnCellClass: 'generic-table__cell--checkbox',
        columnType: {
          type: ColumnTypes.CHECKBOX,
          selectionModel: this.selectionModel()!
        }
      };
      result.unshift(inputCheckboxColumn);
    }

    // Add row number column if enabled
    if (this.showRowNumbers()) {
      const rowNumberColumn: TableColumn<any> = {
        id: 'generic-rowNumber',
        label: this.rowNumberLabel(),
        sortable: false,
        columnClass: 'generic-table__col--row-number',
        columnCellClass: 'generic-table__cell--row-number',
        columnType: {
          type: ColumnTypes.ROW_NUMBERS
        }
      };
      result.unshift(rowNumberColumn);
    }

    return result as TableColumn<T>[];
  });

  readonly sortableColumns = computed(() => {
    return this.columns().filter(
      (col: TableColumn<T>) => col.sortable === true && this.showSort() !== false,
    );
  });

  // Signal to trigger select all state updates
  private selectionUpdateTrigger = signal(0);

  readonly selectAllState = computed(() => {
    // Access the trigger to create dependency
    this.selectionUpdateTrigger();

    const model = this.selectionModel();
    const allData = this.data();

    if (!model || allData.length === 0) {
      return { checked: false, indeterminate: false, disabled: true };
    }

    const selectedCount = model.selected.length;
    const totalCount = allData.length;

    if (selectedCount === 0) {
      return { checked: false, indeterminate: false, disabled: false };
    }

    if (selectedCount === totalCount) {
      return { checked: true, indeterminate: false, disabled: false };
    }

    // Partial selection
    return { checked: false, indeterminate: true, disabled: false };
  });

  onSortChange(key: string): void {
    const currentSort = this.sortSignal();
    const keyAsKeyOf = key as keyof T;

    if (currentSort?.key === keyAsKeyOf) {
      if (currentSort.direction === SortDirection.descending) {
        this.sortSignal.set(undefined);
        return;
      }
      
      // Toggle direction
      const newDirection =
        currentSort.direction === SortDirection.ascending
          ? SortDirection.descending
          : SortDirection.ascending;

      this.sortSignal.set({ key: keyAsKeyOf, direction: newDirection });
    } else {
      // New sort column
      this.sortSignal.set({ key: keyAsKeyOf, direction: SortDirection.ascending });
    }
  }

  onRowClick(item: T): void {
    this.rowClick.emit(item);
  }

  onCheckboxChange(item: T, checked: boolean, column: TableColumn<any>): void {
    if (column.columnType.type !== ColumnTypes.CHECKBOX) return;
    
    const model = column.columnType.selectionModel;
    if (!model) return;

    // Toggle selection state based on checkbox
    if (checked) {
      model.select(item);
    } else {
      model.deselect(item);
    }

    // Trigger select all state update with increment
    this.selectionUpdateTrigger.update((n) => n + 1);
  }

  onSelectAll(checked: boolean, column: TableColumn<any>): void {
    if (column.columnType.type !== ColumnTypes.CHECKBOX) return;
    
    const model = column.columnType.selectionModel;
    if (!model) return;

    const displayData = this.displayData();
    if (checked) {
      // Select all items in dataset
      model.select(...displayData);
    } else {
      // Clear all selections
      model.clear();
    }

    // Trigger select all state update with increment
    this.selectionUpdateTrigger.update((n) => n + 1);
  }

  isItemSelected(item: T, column: TableColumn<any>): boolean {
    if (column.columnType.type !== ColumnTypes.CHECKBOX) return false;
    
    const model = column.columnType.selectionModel;
    // Return false if no model, otherwise check selection
    return model ? model.isSelected(item) : false;
  }

  // Utility methods
  getSortIcon(key: string): string {
    const currentSort = this.sortSignal();
    const keyAsKeyOf = key as keyof T;
    if (currentSort?.key !== keyAsKeyOf) return 'unfold_more';

    return currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  isSortedBy(key: string): boolean {
    const keyAsKeyOf = key as keyof T;
    return this.sortSignal()?.key === keyAsKeyOf;
  }

  getTemplate(name?: string) {
    return this.templateRefs().find(t => t.name === name)?.template;
  }

  getDisplayValue(item: any, column: TableColumn<any>): any {
    // Handle different column types
    switch (column.columnType.type) {
      case ColumnTypes.TEXT:
      case ColumnTypes.DATE:
        // Use formatter if available
        if ('formatter' in column.columnType && column.columnType.formatter) {
          return column.columnType.formatter(item);
        }
        return item[column.columnType.key];
        
      case ColumnTypes.CUSTOM:
        // For custom columns, template handles rendering
        return item[column.columnType.key];
    }
  }

  clearSort(): void {
    this.sortSignal.set(undefined);
  }

  onScroll(event: Event): void {
    if (this.isScrollLoading || !this.hasMoreData()) {
      return;
    }

    const element = event.target as HTMLElement;

    //at bottom of scroll
    if (element.scrollHeight - element.scrollTop - element.clientHeight <= this.SCROLL_THRESHOLD) {
      this.scrollEnd.emit();
      this.isScrollLoading = true;
    }
  }
}