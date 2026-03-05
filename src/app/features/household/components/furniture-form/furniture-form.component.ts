import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FURNITURE_TYPES, type FurnitureType } from '../../models';
import { Subscription } from 'rxjs';

const DEFAULT_COUNT = 1;
const MIN_COUNT = 1;
const MAX_COUNT = 99;

@Component({
  selector: 'app-furniture-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './furniture-form.component.html',
  styleUrls: ['./furniture-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FurnitureFormComponent implements OnDestroy {
  @Output() addFurniture = new EventEmitter<{ furniture: FurnitureType; count: number }>();
  @Output() error = new EventEmitter<string>();

  readonly furnitureTypes = FURNITURE_TYPES;
  form: FormGroup;
  private valueChangesSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      furniture: ['', Validators.required],
      count: [DEFAULT_COUNT, [Validators.required, Validators.min(MIN_COUNT), Validators.max(MAX_COUNT)]]
    });

    // Watch for value changes
    this.valueChangesSubscription = this.form.valueChanges.subscribe(() => {
      // Clear any existing errors when form values change
      this.error.emit('');
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { furniture, count } = this.form.value;
      this.addFurniture.emit({ furniture, count });
      this.form.reset();
      this.form.patchValue({ count: DEFAULT_COUNT });
    }
  }

  ngOnDestroy() {
    this.valueChangesSubscription?.unsubscribe();
  }
}
