import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HouseholdItem } from '../../models';

@Component({
  selector: 'app-household-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './household-table.component.html',
  styleUrls: ['./household-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdTableComponent {
  items = input<HouseholdItem[]>([]);
}
