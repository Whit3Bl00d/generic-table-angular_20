import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';

@Component({
  selector: 'filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  title = input<string>();
  placeholder = input<string>('');
  debounce = input<number>(50);
  control = input.required<FormControl<string | null>>();

  inputChange = output<string>();

  private value = signal('');
  constructor() {
    // Accsessing the form control value and adding logic
    effect((onCleanup) => {
      const delay = untracked(() => this.debounce());

      const subscription = this.control()
        .valueChanges.pipe(
          distinctUntilChanged(),
          tap((value) => {
            this.value.set(value ?? '');
          }),
          debounceTime(delay),
          distinctUntilChanged(),
        )
        .subscribe((value) => {
          this.inputChange.emit(value ?? '');
        });

      // Cleanup the subscription when the effect re-runs
      // or when the component is destroyed.
      onCleanup(() => subscription.unsubscribe());
    });
  }

  showClearButton = computed(() => {
    const val = this.value();
    return !!(val && val.trim().length > 0);
  });

  clearSearch(): void {
    this.control().setValue('');
    // Instant emission for button click (bypassing debounce)
    this.inputChange.emit('');
  }
}
