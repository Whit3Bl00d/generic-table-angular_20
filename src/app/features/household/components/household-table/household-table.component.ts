import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
  OnDestroy,
  input,
  effect,
  linkedSignal,
  inject,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { HouseholdItem } from '../../models';
import { HouseholdItemInterface } from '../../types';
import { HouseholdService, GetDataResult, SortParams, FilterCriterion } from '../../services';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import type { TableColumn } from '../../../../shared/components/generic-table/generic-table.types';
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
  static readonly INFINITE_SCROLL_CHUNK_SIZE = 20;

  private _householdService = inject(HouseholdService);

  readonly filters = input<FilterCriterion<HouseholdItemInterface>[]>([]);
  private currentSort = signal<SortParams<HouseholdItem> | undefined>(undefined);

  private isLoading = signal(false);

  /** Tracks currentBatch; resets to 0 when filters or sort change */
  private readonly currentBatch = linkedSignal({
    source: () => ({ f: this.filters(), s: this.currentSort() }),
    computation: () => 0,
  });

  /** Managed resource for data fetching; reacts to batch, filter, and sort changes */
  readonly itemsResource = rxResource<
    GetDataResult,
    {
      currentBatch: number;
      sort: SortParams<HouseholdItem> | undefined;
      filters: FilterCriterion<HouseholdItemInterface>[];
    }
  >({
    params: () => ({
      currentBatch: this.currentBatch(),
      filters: this.filters(),
      sort: this.currentSort(),
    }),
    stream: ({ params }) =>
      this._householdService.getData(20, params.currentBatch, params.filters, params.sort),
  });

  /**
   * Accumulated items list.
   * Prevents UI flickering by retaining previous values during resource loading.
   * Resets list on fresh batch (0) and appends on subsequent batches.
   */
  readonly items = linkedSignal<{ result: GetDataResult | undefined; batch: number }, HouseholdItem[]>({
    source: () => ({
      result: this.itemsResource.value(),
      batch: this.currentBatch(),
    }),
    computation: (newVal, previous) => {
      const { result, batch } = newVal;
      const prevItems = previous?.value ?? [];

      if (!result) return prevItems;

      if (batch === 0) return result.items;

      return [...prevItems, ...result.items];
    },
  });

  readonly maxDataCount = computed(() => this.itemsResource.value()?.totalCount ?? 0);

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

  onScrollEnd(): void {
    // Prevent duplicate requests
    if (this.isLoading() || this.currentBatch() >= this.maxDataCount()) {
      return;
    }

    this.currentBatch.set(this.currentBatch() + HouseholdTableComponent.INFINITE_SCROLL_CHUNK_SIZE);
  }

  onRowClick(item: HouseholdItem): void {
    console.log('Row clicked:', item);
  }

  onSortChange(sort: SortParams<HouseholdItem> | undefined): void {
    this.currentSort.set(sort);
  }

  ngOnDestroy(): void {
    this.clearSubscription();
  }
}
