import { Component, signal, computed, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HouseholdTableComponent } from '../../components/household-table/household-table.component';
import { HouseholdFormComponent } from '../../components/household-form/household-form.component';
import { FurnitureFormComponent } from '../../components/furniture-form/furniture-form.component';
import type { HouseholdItem, ItemType } from '../../models';
import { generateId } from '../../models';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-household-dashboard',
  standalone: true,
  imports: [CommonModule, HouseholdTableComponent, HouseholdFormComponent, FurnitureFormComponent],
  templateUrl: './household-dashboard.component.html',
  styleUrls: ['./household-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdDashboardComponent implements OnDestroy {
  private itemsSignal = signal<HouseholdItem[]>([]);
  readonly items = this.itemsSignal;

  private searchSubject = new Subject<string>();
  readonly search = toSignal(
    this.searchSubject.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  private errorMessageSignal = signal<string | null>(null);
  readonly errorMessage = this.errorMessageSignal;

  readonly filteredItems = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.itemsSignal();
    return this.itemsSignal().filter((i) => i.name.toLowerCase().includes(q));
  });

  addItem(data: HouseholdItem) {
    this.itemsSignal.update((curr) => [...curr, data]);
    this.clearError();
  }

  addFurniture(data: HouseholdItem) {
    this.itemsSignal.update((curr) => [...curr, data]);
    this.clearError();
  }

  setSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target) {
      this.searchSubject.next('');
      return;
    }
    this.searchSubject.next(target.value);
  }

  showError(message: string) {
    this.errorMessageSignal.set(message);
    setTimeout(() => this.clearError(), 5000);
  }

  clearError() {
    this.errorMessageSignal.set(null);
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
