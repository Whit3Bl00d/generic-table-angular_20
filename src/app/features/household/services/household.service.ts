import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, throwError, tap } from 'rxjs';
import { HouseholdItem, HouseholdItemInterface, DateRange, generateId } from '../types';
import { SortParams, CreateItemRequest, GetDataResult, FilterCriterion } from '../types';
import { SortDirection, ODataOperator } from '../types';

@Injectable({
  providedIn: 'root',
})
export class HouseholdService {
  // Data storage
  private allItems = signal<HouseholdItemInterface[]>([
    new HouseholdItem('1', 'Dining Table', 1, 'furniture', new Date('2023-01-15')),
    new HouseholdItem('2', 'Kitchen Chair', 4, 'furniture', new Date('2023-01-20')),
    new HouseholdItem('3', 'Sofa', 1, 'furniture', new Date('2023-02-10')),
    new HouseholdItem('4', 'Bed', 2, 'furniture', new Date('2023-02-15')),
    new HouseholdItem('5', 'Wardrobe', 1, 'furniture', new Date('2023-03-01')),
    new HouseholdItem('6', 'Desk', 1, 'furniture', new Date('2023-03-10')),
    new HouseholdItem('7', 'Bookshelf', 2, 'furniture', new Date('2023-03-15')),
    new HouseholdItem('8', 'TV Stand', 1, 'furniture', new Date('2023-04-01')),
    new HouseholdItem('9', 'Coffee Table', 1, 'furniture', new Date('2023-04-05')),
    new HouseholdItem('10', 'Nightstand', 2, 'furniture', new Date('2023-04-10')),
    new HouseholdItem('11', 'Dresser', 1, 'furniture', new Date('2023-04-15')),
    new HouseholdItem('12', 'Ottoman', 1, 'furniture', new Date('2023-05-01')),
    new HouseholdItem('13', 'Bench', 1, 'furniture', new Date('2023-05-05')),
    new HouseholdItem('14', 'Recliner', 1, 'furniture', new Date('2023-05-10')),
    new HouseholdItem('15', 'Cabinet', 3, 'furniture', new Date('2023-05-15')),
    new HouseholdItem('16', 'Laptop', 2, 'general', new Date('2023-06-01')),
    new HouseholdItem('17', 'Smartphone', 3, 'general', new Date('2023-06-05')),
    new HouseholdItem('18', 'Tablet', 1, 'general', new Date('2023-06-10')),
    new HouseholdItem('19', 'Headphones', 2, 'general', new Date('2023-06-15')),
    new HouseholdItem('20', 'Keyboard', 3, 'general', new Date('2023-07-01')),
    new HouseholdItem('21', 'Mouse', 4, 'general', new Date('2023-07-05')),
    new HouseholdItem('22', 'Monitor', 2, 'general', new Date('2023-07-10')),
    new HouseholdItem('23', 'Printer', 1, 'general', new Date('2023-07-15')),
    new HouseholdItem('24', 'Router', 1, 'general', new Date('2023-08-01')),
    new HouseholdItem('25', 'External Hard Drive', 2, 'general', new Date('2023-08-05')),
    new HouseholdItem('26', 'Winter Clothes', 15, 'general', {
      start: new Date('2023-11-01'),
      end: new Date('2024-03-31'),
    }),
    new HouseholdItem('27', 'Summer Clothes', 20, 'general', {
      start: new Date('2023-05-01'),
      end: new Date('2023-09-30'),
    }),
    new HouseholdItem('28', 'Holiday Decorations', 10, 'general', {
      start: new Date('2023-12-01'),
      end: new Date('2024-01-15'),
    }),
    new HouseholdItem('29', 'Gaming Console', 1, 'general', new Date('2023-08-10')),
    new HouseholdItem('30', 'Camera', 2, 'general', new Date('2023-08-15')),
    new HouseholdItem('31', 'Speakers', 3, 'general', new Date('2023-09-01')),
    new HouseholdItem('32', 'Desk Lamp', 2, 'furniture', new Date('2023-09-05')),
    new HouseholdItem('33', 'Office Chair', 1, 'furniture', new Date('2023-09-10')),
    new HouseholdItem('34', 'Coffee Maker', 1, 'general', new Date('2023-09-15')),
    new HouseholdItem('35', 'Microwave', 1, 'general', new Date('2023-10-01')),
    new HouseholdItem('36', 'Toaster', 1, 'general', new Date('2023-10-05')),
    new HouseholdItem('37', 'Blender', 1, 'general', new Date('2023-10-10')),
    new HouseholdItem('38', 'Vacuum Cleaner', 1, 'general', new Date('2023-10-15')),
    new HouseholdItem('39', 'Air Purifier', 2, 'general', new Date('2023-11-01')),
    new HouseholdItem('40', 'Space Heater', 1, 'general', new Date('2023-11-05')),
  ]);
  private loading = signal(false);

  public readonly loadingComputed = computed(() => this.loading());

  constructor() {
    this.initializeMockData();
  }

  /**
   * Get data with optional filters, sorting, and next part loading
   */
  getData(
    max: number, // Maximum number of items to return
    top: number, // Number of items to skip (for loading next part)
    filters?: FilterCriterion<HouseholdItemInterface>[],
    sort?: SortParams<HouseholdItemInterface>,
  ): Observable<GetDataResult> {
    this.loading.set(true);

    let processedItems = this.allItems();

    // Apply filters
    if (filters) {
      processedItems = this.applyFilters(processedItems, filters);
    }

    // Apply sorting
    if (sort) {
      processedItems = this.applySorting(processedItems, sort);
    }

    const totalAvailable = processedItems.length;

    // Apply range selection (top/max)
    const selectedItems = processedItems.slice(top, top + max);
    const hasMoreItems = top + max < totalAvailable;

    const result: GetDataResult = {
      items: selectedItems,
      totalCount: totalAvailable,
      hasMore: hasMoreItems,
    };

    return of(result).pipe(
      delay(300 + Math.random() * 200), // Simulate network latency
      tap(() => this.loading.set(false)),
    );
  }

  /**
   * Add a new item (handles both household items and furniture)
   */
  addItem(item: CreateItemRequest): Observable<HouseholdItemInterface> {
    const newItem = new HouseholdItem(
      generateId(),
      item.name,
      item.quantity,
      item.type,
      item.collectionDate,
    );

    const currentItems = this.allItems();
    this.allItems.set([...currentItems, newItem]);

    return of(newItem).pipe(delay(100));
  }

  // === PRIVATE METHODS ===

  private applyFilters(
    items: HouseholdItemInterface[],
    filters: FilterCriterion<HouseholdItemInterface>[],
  ): HouseholdItemInterface[] {
    return items.filter((item) => {
      // Apply each filter criterion
      for (const criterion of filters) {
        const { key, value, operator } = criterion;
        
        if (!this.evaluateFilter(item[key], value, operator)) {
          return false;
        }
      }

      return true;
    });
  }

  private evaluateFilter(itemValue: any, filterValue: any, operator: ODataOperator): boolean {
    switch (operator) {
      case ODataOperator.EQUALS:
        return itemValue === filterValue;
        
      case ODataOperator.NOT_EQUALS:
        return itemValue !== filterValue;
        
      case ODataOperator.CONTAINS:
        if (typeof itemValue === 'string' && typeof filterValue === 'string') {
          return itemValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        return false;
        
      case ODataOperator.GREATER_THAN:
        return itemValue > filterValue;
        
      case ODataOperator.GREATER_THAN_OR_EQUAL:
        return itemValue >= filterValue;
        
      case ODataOperator.LESS_THAN:
        return itemValue < filterValue;
        
      case ODataOperator.LESS_THAN_OR_EQUAL:
        return itemValue <= filterValue;
        
      default:
        return false;
    }
  }

  private applySorting(
    items: HouseholdItemInterface[],
    sort: SortParams<HouseholdItemInterface>,
  ): HouseholdItemInterface[] {
    const { key, direction } = sort;

    return [...items].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle special cases
      if (key === 'collectionDate') {
        aValue = this.getSortValue(aValue);
        bValue = this.getSortValue(bValue);
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return direction === SortDirection.ascending ? -1 : 1;
      if (aValue > bValue) return direction === SortDirection.ascending ? 1 : -1;
      return 0;
    });
  }

  private getSortValue(value: any): any {
    if (!value) return null;

    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === 'object' && 'start' in value) {
      const dateRange = value as DateRange;
      return dateRange.start.getTime();
    }

    return value;
  }

  private initializeMockData(): void {
    // Generate mock data
    const mockItems: HouseholdItemInterface[] = [
      // Furniture items
      new HouseholdItem('1', 'Dining Table', 1, 'furniture', new Date('2023-01-15')),
      new HouseholdItem('2', 'Kitchen Chair', 4, 'furniture', new Date('2023-01-20')),
      new HouseholdItem('3', 'Sofa', 1, 'furniture', new Date('2023-02-10')),
      new HouseholdItem('4', 'Bed', 2, 'furniture', new Date('2023-02-15')),
      new HouseholdItem('5', 'Wardrobe', 1, 'furniture', new Date('2023-03-01')),
      new HouseholdItem('6', 'Desk', 1, 'furniture', new Date('2023-03-10')),
      new HouseholdItem('7', 'Bookshelf', 2, 'furniture', new Date('2023-03-15')),
      new HouseholdItem('8', 'TV Stand', 1, 'furniture', new Date('2023-04-01')),
      new HouseholdItem('9', 'Coffee Table', 1, 'furniture', new Date('2023-04-05')),
      new HouseholdItem('10', 'Nightstand', 2, 'furniture', new Date('2023-04-10')),
      new HouseholdItem('11', 'Dresser', 1, 'furniture', new Date('2023-04-15')),
      new HouseholdItem('12', 'Ottoman', 1, 'furniture', new Date('2023-05-01')),
      new HouseholdItem('13', 'Bench', 1, 'furniture', new Date('2023-05-05')),
      new HouseholdItem('14', 'Recliner', 1, 'furniture', new Date('2023-05-10')),
      new HouseholdItem('15', 'Cabinet', 3, 'furniture', new Date('2023-05-15')),
      ...Array.from({ length: 200 }, (_, i) => 
        new HouseholdItem(
          (16 + i).toString(),
          `mock-item-${16 + i}`,
          Math.floor(Math.random() * 10) + 1,
          'general'
        )
      ),
      new HouseholdItem('16', 'Laptop', 2, 'general', new Date('2023-06-01')),
      new HouseholdItem('17', 'Smartphone', 3, 'general', new Date('2023-06-05')),
      new HouseholdItem('18', 'Tablet', 1, 'general', new Date('2023-06-10')),
      new HouseholdItem('19', 'Headphones', 2, 'general', new Date('2023-06-15')),
      new HouseholdItem('20', 'Keyboard', 3, 'general', new Date('2023-07-01')),
      new HouseholdItem('21', 'Mouse', 4, 'general', new Date('2023-07-05')),
      new HouseholdItem('22', 'Monitor', 2, 'general', new Date('2023-07-10')),
      new HouseholdItem('23', 'Printer', 1, 'general', new Date('2023-07-15')),
      new HouseholdItem('24', 'Router', 1, 'general', new Date('2023-08-01')),
      new HouseholdItem('25', 'External Hard Drive', 2, 'general', new Date('2023-08-05')),
      new HouseholdItem('26', 'Winter Clothes', 15, 'general', {
        start: new Date('2023-11-01'),
        end: new Date('2024-03-31'),
      }),
      new HouseholdItem('27', 'Summer Clothes', 20, 'general', {
        start: new Date('2023-05-01'),
        end: new Date('2023-09-30'),
      }),
      new HouseholdItem('28', 'Holiday Decorations', 10, 'general', {
        start: new Date('2023-12-01'),
        end: new Date('2024-01-15'),
      }),
      new HouseholdItem('29', 'Gaming Console', 1, 'general', new Date('2023-08-10')),
      new HouseholdItem('30', 'Camera', 2, 'general', new Date('2023-08-15')),
      new HouseholdItem('31', 'Speakers', 3, 'general', new Date('2023-09-01')),
      new HouseholdItem('32', 'Desk Lamp', 2, 'furniture', new Date('2023-09-05')),
      new HouseholdItem('33', 'Office Chair', 1, 'furniture', new Date('2023-09-10')),
      new HouseholdItem('34', 'Coffee Maker', 1, 'general', new Date('2023-09-15')),
      new HouseholdItem('35', 'Microwave', 1, 'general', new Date('2023-10-01')),
      new HouseholdItem('36', 'Toaster', 1, 'general', new Date('2023-10-05')),
      new HouseholdItem('37', 'Blender', 1, 'general', new Date('2023-10-10')),
      new HouseholdItem('38', 'Vacuum Cleaner', 1, 'general', new Date('2023-10-15')),
      new HouseholdItem('39', 'Air Purifier', 2, 'general', new Date('2023-11-01')),
      new HouseholdItem('40', 'Space Heater', 1, 'general', new Date('2023-11-05'))
    ];

    this.allItems.set(mockItems);
  }
}
