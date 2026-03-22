import {
  Component,
  input,
  computed,
  signal,
  ChangeDetectionStrategy,
  OnDestroy,
  output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { HouseholdItem } from '../../models';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import type { TableColumn, TableSort } from '../../../../shared/components/generic-table/generic-table.types';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-household-table',
  standalone: true,
  imports: [
    CommonModule,
    GenericTableComponent,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
  ],

  templateUrl: './household-table.component.html',
  styleUrls: ['./household-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HouseholdTableComponent implements OnDestroy {
  items = input<HouseholdItem[]>([]);
  maxDataCount = input<number>(0);

  // Outputs for event delegation
  rowClick = output<HouseholdItem>();
  scrollEnd = output<void>();
  sortChange = output<TableSort<HouseholdItem> | null>();

  constructor() {}

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
      model.compareWith = (a: HouseholdItem, b: HouseholdItem) => HouseholdItem.isSameItem(a, b);
      return model;
    }

    // Preserve selection from previous selection variable
    const itemsToSelect = this.previousSelection.filter((selectedItem: HouseholdItem) =>
      currentItems.some((item: HouseholdItem) => HouseholdItem.isSameItem(item, selectedItem)),
    );

    // Create new SelectionModel with preserved selection
    const newModel = new SelectionModel<HouseholdItem>(true, itemsToSelect);

    newModel.compareWith = (a: HouseholdItem, b: HouseholdItem) => HouseholdItem.isSameItem(a, b);

    // Subscribe to SelectionModel changes to update previousSelection
    this.clearSubscription();

    this.changedSubscription = newModel.changed.subscribe(() => {
      this.previousSelection = [...newModel.selected];
    });

    return newModel;
  });

  readonly columns = computed(() => {
    const columns: TableColumn<HouseholdItem>[] = [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        columnClass: 'household-table__col--name',
        columnCellClass: 'household-table__cell--name',
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        columnClass: 'household-table__col--type',
        columnCellClass: 'household-table__cell--type',
      },
      {
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        columnClass: 'household-table__col--quantity',
        columnCellClass: 'household-table__cell--quantity',
      },
      {
        key: 'collectionDate',
        label: 'Collection Date',
        sortable: true,
        columnClass: 'household-table__col--date',
        columnCellClass: 'household-table__cell--date',
        formatter: (item: HouseholdItem) => HouseholdItem.formatDate(item),
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

  onScrollEnd(): void {
    this.scrollEnd.emit();
  }

  onRowClick(item: HouseholdItem): void {
    this.rowClick.emit(item);
  }

  onSortChange(sort: TableSort<HouseholdItem> | null): void {
    this.sortChange.emit(sort);
  }
}
