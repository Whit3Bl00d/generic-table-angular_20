import { ItemType, DateRange, HouseholdItemInterface } from './household-item.types';
import { SortDirection } from '../../../shared/components/generic-table/generic-table.types';

// Request/Response types for API operations
export interface CreateItemRequest {
  name: string;
  quantity: number;
  type: ItemType;
  collectionDate?: Date | DateRange;
}

// Query and filtering types
export interface SortParams {
  key: keyof HouseholdItemInterface;
  direction: SortDirection;
}

export interface FilterParams {
  name?: string;
  type?: ItemType;
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

// Data retrieval result type
export interface GetDataResult {
  items: HouseholdItemInterface[];
  totalCount: number;
  hasMore: boolean;
}
