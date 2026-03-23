import { Observable } from 'rxjs';
import { HouseholdItemInterface } from './household-item.types';
import { CreateItemRequest, FilterParams, SortParams, GetDataResult } from './api.types';

// Service interface defining the contract
export interface IHouseholdService {
  getData(
    max: number,
    top: number,
    filters?: FilterParams,
    sort?: SortParams
  ): Observable<GetDataResult>;
  addItem(item: CreateItemRequest): Observable<HouseholdItemInterface>;
}
