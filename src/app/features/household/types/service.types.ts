import { Observable } from 'rxjs';
import { HouseholdItemInterface } from './household-item.types';
import { CreateItemRequest, GetDataResult } from './api.types';
import { FilterCriterion, SortParams } from '../services';

// Service interface defining the contract
export interface IHouseholdService {
  getData(
    max: number,
    top: number,
    filters?: FilterCriterion<HouseholdItemInterface>[],
    sort?: SortParams<HouseholdItemInterface>
  ): Observable<GetDataResult>;
  addItem(item: CreateItemRequest): Observable<HouseholdItemInterface>;
}
