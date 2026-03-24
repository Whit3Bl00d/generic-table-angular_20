import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HouseholdService, CreateItemRequest } from '../../services';

const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 1;

@Component({
  selector: 'app-household-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './household-form.component.html',
  styleUrls: ['./household-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export class HouseholdFormComponent implements OnDestroy {
  compStart = new Date(2026, 2, 3);
  compEnd = new Date(2026, 2, 9);

  form: FormGroup;
  private valueChangesSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder, private householdService: HouseholdService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      quantity: [DEFAULT_QUANTITY, [Validators.required, Validators.min(MIN_QUANTITY)]],
      type: ['general'],
      collectionDateRange: this.fb.group({
        start: [null],
        end: [null],
      }),
    });

    // Watch for value changes
    this.valueChangesSubscription = this.form.valueChanges.subscribe(() => {
      // Clear any existing errors when form values change
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.value;
      const collectionDateRange = formValues.collectionDateRange;
      
      const createRequest: CreateItemRequest = {
        name: formValues.name?.trim() || '',
        quantity: formValues.quantity || DEFAULT_QUANTITY,
        type: formValues.type || 'general',
        collectionDate: collectionDateRange?.start && collectionDateRange?.end
          ? {
              start: collectionDateRange.start,
              end: collectionDateRange.end,
            }
          : undefined,
      };

      this.householdService.addItem(createRequest).subscribe({
        next: () => {
          this.form.reset();
          this.form.patchValue({
            type: 'general',
            quantity: DEFAULT_QUANTITY,
            collectionDateRange: {
              start: '',
              end: '',
            },
          });
        },
        error: (error) => {
          console.error('Failed to add item:', error);
        }
      });
    }
  }

  ngOnDestroy() {
    this.valueChangesSubscription?.unsubscribe();
  }
}
