import {
  Component,
  input,
  computed,
  signal,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { SelectionModel } from '@angular/cdk/collections';

import type { HouseholdItem } from '../../models';

import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';

import type { TableColumn } from '../../../../shared/components/generic-table/generic-table.types';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-household-table',

  standalone: true,

  imports: [CommonModule, GenericTableComponent],

  templateUrl: './household-table.component.html',

  styleUrls: ['./household-table.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdTableComponent implements OnDestroy {
  items = input<HouseholdItem[]>([]);

  // Store previous selection as regular variable

  private previousSelection: HouseholdItem[] = [];

  changedSubscription!: Subscription; // type of observable.subscribe return

  // Selection model as computed that preserves previous selection

  selectionModel = computed(() => {
    const currentItems = this.items();

    // Always return a SelectionModel instance

    if (currentItems.length === 0) {
      this.previousSelection = [];
      const model = new SelectionModel<HouseholdItem>(true);
      model.compareWith = (a: HouseholdItem, b: HouseholdItem) => this.isSameItem(a, b);
      return model;
    }

    // Preserve selection from previous selection variable

    const itemsToSelect = this.previousSelection.filter((selectedItem: HouseholdItem) =>
      currentItems.some((item: HouseholdItem) => this.isSameItem(item, selectedItem)),
    );

    // Create new SelectionModel with preserved selection

    const newModel = new SelectionModel<HouseholdItem>(true, itemsToSelect);
    newModel.compareWith = (a: HouseholdItem, b: HouseholdItem) => this.isSameItem(a, b);

    // Subscribe to SelectionModel changes to update previousSelection

    this.clearSubscription();

    this.changedSubscription = newModel.changed.subscribe(() => {
      this.previousSelection = [...newModel.selected];
    });

    return newModel;
  });

  // Helper to determine if items are the same using ID
  private isSameItem(item1: HouseholdItem, item2: HouseholdItem): boolean {
    // Use ID property for reliable comparison
    return item1.id === item2.id;
  }

  readonly columns = computed(() => {
    const columns: TableColumn<HouseholdItem>[] = [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        filterable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        filterable: true,
      },
      {
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        filterable: false,
      },
    ];
    return columns;
  });

  /**
   * Clears all current selections in the selection model
   */
  clearSubscription(): void {
    if (this.changedSubscription) {
      this.changedSubscription.unsubscribe();
    }
  }

  // Implement ngOnDestroy to clean up subscription

  ngOnDestroy(): void {
    this.clearSubscription();
  }
}
