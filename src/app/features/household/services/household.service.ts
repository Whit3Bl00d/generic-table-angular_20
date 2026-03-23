import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, throwError, tap } from 'rxjs';
import { 
  HouseholdItem, 
  HouseholdItemInterface,
  ItemType, 
  DateRange, 
  generateId
} from '../types';
import { 
  SortParams, 
  FilterParams, 
  CreateItemRequest,
  GetDataResult
} from '../types';
import { SortDirection } from '../types';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
  private readonly STORAGE_KEY = 'household_items';
  
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
      end: new Date('2024-03-31')
    }),
    new HouseholdItem('27', 'Summer Clothes', 20, 'general', {
      start: new Date('2023-05-01'),
      end: new Date('2023-09-30')
    }),
    new HouseholdItem('28', 'Holiday Decorations', 10, 'general', {
      start: new Date('2023-12-01'),
      end: new Date('2024-01-15')
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
    max: number,    // Maximum number of items to return
    top: number,     // Number of items to skip (for loading next part)
    filters?: FilterParams,
    sort?: SortParams
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
    const hasMoreItems = (top + max) < totalAvailable;
    
    const result: GetDataResult = {
      items: selectedItems,
      totalCount: totalAvailable,
      hasMore: hasMoreItems
    };
    
    return of(result).pipe(
      delay(300 + Math.random() * 200), // Simulate network latency
      tap(() => this.loading.set(false))
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
      item.collectionDate
    );

    const currentItems = this.allItems();
    this.allItems.set([...currentItems, newItem]);
    this.saveToStorage();

    return of(newItem).pipe(delay(100));
  }

  // === PRIVATE METHODS ===

  private applyFilters(items: HouseholdItemInterface[], filters: FilterParams): HouseholdItemInterface[] {
    return items.filter(item => {
      // Name filter
      if (filters.name && filters.name.trim()) {
        const searchTerm = filters.name.toLowerCase();
        if (!item.name.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Type filter
      if (filters.type && item.type !== filters.type) {
        return false;
      }

      // Quantity filters
      if (filters.quantity !== undefined && item.quantity !== filters.quantity) {
        return false;
      }

      if (filters.minQuantity !== undefined && item.quantity < filters.minQuantity) {
        return false;
      }

      if (filters.maxQuantity !== undefined && item.quantity > filters.maxQuantity) {
        return false;
      }

      return true;
    });
  }

  private applySorting(items: HouseholdItemInterface[], sort: SortParams): HouseholdItemInterface[] {
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
    const storedItems = this.loadFromStorage();
    
    if (storedItems.length > 0) {
      this.allItems.set(storedItems);
      return;
    }

    // Generate mock data
    const mockItems: HouseholdItemInterface[] = [
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
      
      // General items
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
      
      // Items with date ranges
      new HouseholdItem('26', 'Winter Clothes', 15, 'general', {
        start: new Date('2023-11-01'),
        end: new Date('2024-03-31')
      }),
      new HouseholdItem('27', 'Summer Clothes', 20, 'general', {
        start: new Date('2023-05-01'),
        end: new Date('2023-09-30')
      }),
      new HouseholdItem('28', 'Holiday Decorations', 10, 'general', {
        start: new Date('2023-12-01'),
        end: new Date('2024-01-15')
      }),
      
      // More items for testing
      ...Array.from({ length: 20 }, (_, i) => 
        new HouseholdItem(
          `mock_${i + 29}`,
          `Mock Item ${i + 29}`,
          Math.floor(Math.random() * 10) + 1,
          Math.random() > 0.5 ? 'general' : 'furniture',
          new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        )
      )
    ];

    this.allItems.set(mockItems);
    this.saveToStorage();
  }

  private isValidFurnitureType(name: string): boolean {
    const furnitureTypes = [
      'Chair', 'Table', 'Sofa', 'Bed', 'Wardrobe', 'Desk',
      'Bookshelf', 'Cabinet', 'Dresser', 'Nightstand',
      'Coffee Table', 'TV Stand', 'Ottoman', 'Bench', 'Recliner'
    ];
    return furnitureTypes.includes(name);
  }

  private saveToStorage(): void {
    try {
      const serialized = JSON.stringify(this.allItems());
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  private loadFromStorage(): HouseholdItemInterface[] {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) return [];
      
      const parsed = JSON.parse(serialized);
      return parsed.map((item: any) => 
        new HouseholdItem(
          item.id,
          item.name,
          item.quantity,
          item.type,
          item.collectionDate ? new Date(item.collectionDate) : undefined
        )
      );
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return [];
    }
  }
}
