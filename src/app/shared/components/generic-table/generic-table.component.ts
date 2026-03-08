import {
  Component,
  input,
  computed,
  signal,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import type { TableColumn, TableFilter, TableSort } from './generic-table.types';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatIconModule, MatButtonModule],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericTableComponent<T extends Record<string | number, any>> {
  // Inputs
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  emptyTemplate = input<TemplateRef<any> | undefined>(undefined);
  showFilters = input<boolean>(true);
  showSort = input<boolean>(true);
  showSortShowcase = input<boolean>(false);
  showRowNumbers = input<boolean>(false);
  rowNumberLabel = input<string>('#');
  selectionModel = input<SelectionModel<T> | undefined>(undefined);

  // Outputs
  @Output() rowClick = new EventEmitter<T>();

  // Private signals
  private filterSignal = signal<TableFilter<T>[]>([]);
  private sortSignal = signal<TableSort<T> | null>(null);

  // Computed properties
  readonly filteredAndSortedData = computed(() => {
    let data = [...this.data()];

    // Apply filters
    const activeFilters = this.filterSignal();

    if (activeFilters.length > 0) {
      data = data.filter((item) => {
        return activeFilters.every((filter) => {
          const value = item[filter.key as keyof T];

          if (value === null || value === undefined) {
            return false;
          }

          return String(value).toLowerCase().includes(filter.value.toLowerCase());
        });
      });
    }

    // Apply sorting
    const activeSort = this.sortSignal();

    if (activeSort) {
      data.sort((a, b) => {
        const aValue = a[activeSort.key as keyof T];

        const bValue = b[activeSort.key as keyof T];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return activeSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return activeSort.direction === 'asc' ? 1 : -1;

        return 0;
      });
    }

    return data;
  });

  readonly displayData = computed(() => {
    const data = this.filteredAndSortedData();

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

    // Add row number column first if enabled
    if (this.showRowNumbers()) {
      const rowNumberColumn: TableColumn<any> = {
        key: 'rowNumber',
        label: this.rowNumberLabel(),
        sortable: false,
        filterable: false,
      };
      result.unshift(rowNumberColumn);
    }

    // Add checkbox column first if selection model is provided
    // This ensures checkboxes appear as the leftmost column
    if (this.selectionModel()) {
      const checkboxColumn: TableColumn<any> = {
        key: 'checkbox',
        label: '',
        sortable: false,
        filterable: false,
      };
      result.unshift(checkboxColumn);
    }

    return result as TableColumn<T>[];
  });

  readonly filterableColumns = computed(() => {
    return this.columns().filter(
      (col: TableColumn<T>) => col.filterable && this.showFilters() !== false,
    );
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

  // Event handlers
  onFilterChange(key: string, value: string): void {
    const currentFilters = this.filterSignal();
    const existingIndex = currentFilters.findIndex((f) => f.key === key);

    if (value.trim() === '') {
      // Remove filter if empty
      const newFilters =
        existingIndex >= 0
          ? currentFilters.slice(0, existingIndex).concat(currentFilters.slice(existingIndex + 1))
          : currentFilters;

      this.filterSignal.set(newFilters);
    } else {
      // Add or update filter
      const newFilter = { key: key as keyof T, value: value.trim() };
      const newFilters =
        existingIndex >= 0
          ? currentFilters
              .slice(0, existingIndex)
              .concat([newFilter])
              .concat(currentFilters.slice(existingIndex + 1))
          : [...currentFilters, newFilter];

      this.filterSignal.set(newFilters);
    }
  }

  onSortChange(key: string): void {
    const currentSort = this.sortSignal();
    const keyAsKeyOf = key as keyof T;

    if (currentSort?.key === keyAsKeyOf) {
      // Toggle direction
      const newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';

      this.sortSignal.set({ key: keyAsKeyOf, direction: newDirection });
    } else {
      // New sort column
      this.sortSignal.set({ key: keyAsKeyOf, direction: 'asc' });
    }
  }

  onRowClick(item: T): void {
    this.rowClick.emit(item);
  }

  onCheckboxChange(item: T, checked: boolean): void {
    const model = this.selectionModel();
    if (!model) return;

    // Toggle selection state based on checkbox
    if (checked) {
      model.select(item);
    } else {
      model.deselect(item);
    }

    // Trigger select all state update with increment
    this.selectionUpdateTrigger.update((n) => n + 1);
    console.log(model);
  }

  onSelectAll(checked: boolean): void {
    const model = this.selectionModel();
    if (!model) return;

    const displayData = this.displayData();
    if (checked) {
      // Select all items in the dataset
      model.select(...displayData);
      console.log(model);
    } else {
      // Clear all selections
      model.clear();
    }

    // Trigger select all state update with increment
    this.selectionUpdateTrigger.update((n) => n + 1);
  }

  isItemSelected(item: T): boolean {
    const model = this.selectionModel();
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

  getDisplayValue(item: any, key: keyof T | 'rowNumber' | 'checkbox'): any {
    if (key === 'checkbox') {
      return this.isItemSelected(item);
    }

    if (key === 'rowNumber') {
      return item.rowNumber;
    }

    return item[key as keyof T];
  }

  clearFilters(): void {
    this.filterSignal.set([]);
  }

  clearSort(): void {
    this.sortSignal.set(null);
  }
}
