import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HouseholdItem } from '../../models';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import type { TableColumn } from '../../../../shared/components/generic-table/generic-table.types';

@Component({
  selector: 'app-household-table',
  standalone: true,
  imports: [CommonModule, GenericTableComponent],
  templateUrl: './household-table.component.html',
  styleUrls: ['./household-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdTableComponent {
  items = input<HouseholdItem[]>([]);

  readonly columns = computed(() => {
    const columns: TableColumn<HouseholdItem>[] = [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        filterable: true
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        filterable: true
      },
      {
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        filterable: false
      }
    ];
    return columns;
  });
}
