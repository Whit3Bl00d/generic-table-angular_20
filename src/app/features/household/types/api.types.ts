import { ItemType, HouseholdItemInterface } from './household-item.types';
import { SortDirection, SortParams, FilterCriterion, ODataOperator, DateRange } from '../../../shared/types/shared.types';

// Request/Response types for API operations
export interface CreateItemRequest {
  name: string;
  quantity: number;
  type: ItemType;
  collectionDate?: Date | DateRange;
}

// Data retrieval result type
export interface GetDataResult {
  items: HouseholdItemInterface[];
  totalCount: number;
  hasMore: boolean;
}
