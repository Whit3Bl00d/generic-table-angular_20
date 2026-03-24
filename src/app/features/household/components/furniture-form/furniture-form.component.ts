import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HouseholdService, CreateItemRequest } from '../../services';

const DEFAULT_COUNT = 1;
const MIN_COUNT = 1;
const MAX_COUNT = 99;

const FURNITURE_TYPES = [
  'Chair', 'Table', 'Sofa', 'Bed', 'Wardrobe', 'Desk',
  'Bookshelf', 'Cabinet', 'Dresser', 'Nightstand',
  'Coffee Table', 'TV Stand', 'Ottoman', 'Bench', 'Recliner'
] as const;

@Component({
  selector: 'app-furniture-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './furniture-form.component.html',
  styleUrls: ['./furniture-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export class FurnitureFormComponent implements OnDestroy {
  readonly furnitureTypes = FURNITURE_TYPES;
  form: FormGroup;
  private valueChangesSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder, private householdService: HouseholdService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      quantity: [DEFAULT_COUNT, [Validators.required, Validators.min(MIN_COUNT), Validators.max(MAX_COUNT)]],
      type: ['furniture'],
      collectionDate: [null]
    });

    // Watch for value changes
    this.valueChangesSubscription = this.form.valueChanges.subscribe(() => {
      // Clear any existing errors when form values change
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.value;
      
      const createRequest: CreateItemRequest = {
        name: formValues.name || '',
        quantity: formValues.quantity || DEFAULT_COUNT,
        type: formValues.type || 'furniture',
        collectionDate: formValues.collectionDate || undefined
      };

      this.householdService.addItem(createRequest).subscribe({
        next: () => {
          this.form.reset();
          this.form.patchValue({ 
            type: 'furniture',
            quantity: DEFAULT_COUNT 
          });
        },
        error: (error) => {
          console.error('Failed to add furniture:', error);
        }
      });
    }
  }

  ngOnDestroy() {
    this.valueChangesSubscription?.unsubscribe();
  }
}
