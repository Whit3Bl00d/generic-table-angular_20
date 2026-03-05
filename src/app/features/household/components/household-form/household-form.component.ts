import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 1;

@Component({
  selector: 'app-household-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './household-form.component.html',
  styleUrls: ['./household-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdFormComponent implements OnDestroy {
  @Output() addItem = new EventEmitter<{ name: string; quantity: number }>();
  @Output() error = new EventEmitter<string>();

  form: FormGroup;
  private valueChangesSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      quantity: [DEFAULT_QUANTITY, [Validators.required, Validators.min(MIN_QUANTITY)]]
    });

    // Watch for value changes
    this.valueChangesSubscription = this.form.valueChanges.subscribe(() => {
      // Clear any existing errors when form values change
      this.error.emit('');
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { name, quantity } = this.form.value;
      this.addItem.emit({ name: name.trim(), quantity });
      this.form.reset();
      this.form.patchValue({ quantity: DEFAULT_QUANTITY });
    }
  }

  ngOnDestroy() {
    this.valueChangesSubscription?.unsubscribe();
  }
}
