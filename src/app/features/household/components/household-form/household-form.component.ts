import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HouseholdItem, DateRange, generateId } from '../../models';

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
  @Output() addItem = new EventEmitter<HouseholdItem>();
  @Output() error = new EventEmitter<string>();

  compStart = new Date(2026, 2, 3);
  compEnd = new Date(2026, 2, 9);

  form: FormGroup;
  private valueChangesSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [generateId()],
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
      this.error.emit('');
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.value;
      const collectionDateRange = formValues.collectionDateRange;
      const householdItem = new HouseholdItem(
        formValues.id || generateId(),
        formValues.name?.trim() || '',
        formValues.quantity || DEFAULT_QUANTITY,
        formValues.type || 'general',
        collectionDateRange?.start && collectionDateRange?.end
          ? {
              start: collectionDateRange.start,
              end: collectionDateRange.end,
            }
          : undefined,
      );
      this.addItem.emit(householdItem);
      this.form.reset();
      this.form.patchValue({
        id: generateId(),
        type: 'general',
        quantity: DEFAULT_QUANTITY,
        collectionDateRange: {
          start: '',
          end: '',
        },
      });
    }
  }

  ngOnDestroy() {
    this.valueChangesSubscription?.unsubscribe();
  }
}
