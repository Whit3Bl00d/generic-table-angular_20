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

import type { TableColumn, TableFilter, TableSort } from './generic-table.types';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule],
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
  showRowNumbers = input<boolean>(false);
  rowNumberLabel = input<string>('#');

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

    if (!this.showRowNumbers()) {
      return columns;
    }

    const rowNumberColumn: TableColumn<T & { rowNumber: string }> = {
      key: 'rowNumber',
      label: this.rowNumberLabel(),
      sortable: false,
      filterable: false,
    };
    return [rowNumberColumn, ...columns];
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

  // Event handlers
  onFilterChange(key: string, value: string) {
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

  onSortChange(key: string) {
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

  onRowClick(item: T) {
    this.rowClick.emit(item);
  }

  // Utility methods
  getSortIcon(key: string): string {
    const currentSort = this.sortSignal();

    const keyAsKeyOf = key as keyof T;

    if (currentSort?.key !== keyAsKeyOf) return '↕️';

    return currentSort.direction === 'asc' ? '↑' : '↓';
  }

  isSortedBy(key: string): boolean {
    const keyAsKeyOf = key as keyof T;

    return this.sortSignal()?.key === keyAsKeyOf;
  }

  getDisplayValue(item: any, key: keyof T | 'rowNumber'): any {
    if (key === 'rowNumber') {
      return item.rowNumber;
    }

    return item[key as keyof T];
  }

  // Public API methods
  clearFilters() {
    this.filterSignal.set([]);
  }

  clearSort() {
    this.sortSignal.set(null);
  }
}
