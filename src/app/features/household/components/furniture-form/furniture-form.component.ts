import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FURNITURE_TYPES, type FurnitureType } from '../../models';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HouseholdItem, generateId } from '../../models';

const DEFAULT_COUNT = 1;
const MIN_COUNT = 1;
const MAX_COUNT = 99;

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
  @Output() addFurniture = new EventEmitter<HouseholdItem>();
  @Output() error = new EventEmitter<string>();

  readonly furnitureTypes = FURNITURE_TYPES;
  form: FormGroup;
  private valueChangesSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [generateId()],
      name: ['', Validators.required],
      quantity: [DEFAULT_COUNT, [Validators.required, Validators.min(MIN_COUNT), Validators.max(MAX_COUNT)]],
      type: ['furniture'],
      collectionDate: [null]  // Use collectionDate from HouseholdItem class
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
      const householdItem = new HouseholdItem(
        formValues.id || generateId(),
        formValues.name || '',
        formValues.quantity || DEFAULT_COUNT,
        formValues.type || 'furniture',
        formValues.collectionDate || undefined
      );
      this.addFurniture.emit(householdItem);
      this.form.reset();
      this.form.patchValue({ 
        id: generateId(),
        type: 'furniture',
        quantity: DEFAULT_COUNT 
      });
    }
  }

  ngOnDestroy() {
    this.valueChangesSubscription?.unsubscribe();
  }
}
