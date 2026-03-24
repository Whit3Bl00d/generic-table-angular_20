import { Component, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

import { FilterComponent } from '../../../../shared/components/filter/filter.component';
import { HouseholdTableComponent } from '../../components/household-table/household-table.component';
import { HouseholdFormComponent } from '../../components/household-form/household-form.component';
import { FurnitureFormComponent } from '../../components/furniture-form/furniture-form.component';
import { FilterCriterion, ODataOperator } from '../../services';
import { HouseholdItem } from '../../models';

@Component({
  selector: 'app-household-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HouseholdTableComponent,
    HouseholdFormComponent,
    FurnitureFormComponent,
    FilterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './household-dashboard.component.html',
  styleUrls: ['./household-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdDashboardComponent {
  filters = new FormGroup({
    name: new FormControl<string>(''),
    type: new FormControl<string>(''),
    quantity: new FormControl<string>(''),
  });

  readonly name = signal<string>('');
  readonly type = signal<string>('');
  readonly quantity = signal<string>('');

  readonly filterParams = computed(() => {
    const name = this.name();
    const type = this.type();
    const quantity = this.quantity();

    const criteria: FilterCriterion<HouseholdItem>[] = [];

    if (name) {
      criteria.push({
        key: 'name',
        value: name,
        operator: ODataOperator.CONTAINS,
      });
    }

    if (type) {
      criteria.push({
        key: 'type',
        value: type,
        operator: ODataOperator.EQUALS,
      });
    }

    if (quantity) {
      criteria.push({
        key: 'quantity',
        value: parseInt(quantity, 10),
        operator: ODataOperator.EQUALS,
      });
    }

    return criteria;
  });
}
