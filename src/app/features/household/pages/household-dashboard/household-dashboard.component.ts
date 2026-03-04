import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HouseholdTableComponent } from '../../components/household-table/household-table.component';
import { HouseholdFormComponent } from '../../components/household-form/household-form.component';
import type { HouseholdItem } from '../../models';

@Component({
  selector: 'app-household-dashboard',
  standalone: true,
  imports: [CommonModule, HouseholdTableComponent, HouseholdFormComponent],
  templateUrl: './household-dashboard.component.html',
  styleUrls: ['./household-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdDashboardComponent {
  private nextId = 1;

  private itemsSignal = signal<HouseholdItem[]>([]);
  readonly items = this.itemsSignal;

  private searchSignal = signal('');
  readonly search = this.searchSignal;

  readonly filteredItems = computed(() => {
    const q = this.searchSignal().trim().toLowerCase();
    if (!q) return this.itemsSignal();
    return this.itemsSignal().filter((i) => i.name.toLowerCase().includes(q));
  });

  addItem(data: { name: string; quantity: number }) {
    const item: HouseholdItem = { id: this.nextId++, name: data.name, quantity: data.quantity };
    this.itemsSignal.update((curr) => [...curr, item]);
  }

  setSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSignal.set(value);
  }
}
