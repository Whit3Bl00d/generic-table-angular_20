export { HouseholdService } from './household.service';

// Re-export essential types for consumers
export type { 
  GetDataResult,
  CreateItemRequest,
  SortParams, 
  FilterParams,
  ItemType,
  DateRange,
  HouseholdItem,
  HouseholdItemInterface
} from '../types';
export { SortDirection } from '../types';
