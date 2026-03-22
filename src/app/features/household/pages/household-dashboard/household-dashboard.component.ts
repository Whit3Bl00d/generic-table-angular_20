import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

import { HouseholdItem } from '../../models';
import { FilterComponent } from '../../../../shared/components/filter/filter.component';
import type { TableSort } from '../../../../shared/components/generic-table/generic-table.types';
import { HouseholdTableComponent } from '../../components/household-table/household-table.component';
import { HouseholdFormComponent } from '../../components/household-form/household-form.component';
import { FurnitureFormComponent } from '../../components/furniture-form/furniture-form.component';


@Component({
  selector: 'app-household-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HouseholdTableComponent,
    HouseholdFormComponent,
    FurnitureFormComponent,
    FilterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './household-dashboard.component.html',
  styleUrls: ['./household-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdDashboardComponent {
  private itemsSignal = signal<HouseholdItem[]>([]);
  readonly maxDataCount = signal<number>(10);

  filters = new FormGroup({
    name: new FormControl<string>(''),
    type: new FormControl<string>(''),
    quantity: new FormControl<string>('')
  });

  private sortSignal = signal<TableSort<HouseholdItem> | null>(null);

  private errorMessageSignal = signal<string | null>(null);
  readonly errorMessage = this.errorMessageSignal;

  readonly filteredItems = computed(() => {
    let items = this.itemsSignal();

    // Apply name filter
    const nameQ = this.filters.value.name?.trim().toLowerCase() || '';
    const typeQ = this.filters.value.type?.trim().toLowerCase() || '';
    const quantityQ = this.filters.value.quantity?.trim();
    
    if (nameQ) {
      items = items.filter((i) => i.name.toLowerCase().includes(nameQ));
    }
    
    if (typeQ) {
      items = items.filter((i) => i.type.toLowerCase().includes(typeQ));
    }
    
    if (quantityQ) {
      items = items.filter((i) => i.quantity.toString().includes(quantityQ));
    }

    // Apply sorting
    const activeSort = this.sortSignal();
    if (activeSort) {
      items.sort((a, b) => {
        const aValue = a[activeSort.key as keyof HouseholdItem];
        const bValue = b[activeSort.key as keyof HouseholdItem];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return activeSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return activeSort.direction === 'asc' ? 1 : -1;

        return 0;
      });
    }

    return items;
  });

  addItem(data: HouseholdItem) {
    this.itemsSignal.update((curr) => [...curr, data]);
    this.clearError();
  }

  addFurniture(data: HouseholdItem) {
    this.itemsSignal.update((curr) => [...curr, data]);
    this.clearError();
  }

  onNameChange(nameValue: string): void {
    this.filters.patchValue({ name: nameValue });
  }
  
  onTypeChange(typeValue: string): void {
    this.filters.patchValue({ type: typeValue });
  }
  
  onQuantityChange(quantityValue: string): void {
    this.filters.patchValue({ quantity: quantityValue });
  }

  onSortChange(sort: TableSort<HouseholdItem> | null): void {
    this.sortSignal.set(sort);
  }

  showError(message: string) {
    this.errorMessageSignal.set(message);
    setTimeout(() => this.clearError(), 5000);
  }

  clearError() {
    this.errorMessageSignal.set(null);
  }
}
