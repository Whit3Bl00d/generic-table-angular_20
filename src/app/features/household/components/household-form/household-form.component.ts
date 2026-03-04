import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 1;

@Component({
  selector: 'app-household-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './household-form.component.html',
  styleUrls: ['./household-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdFormComponent {
  @Output() addItem = new EventEmitter<{ name: string; quantity: number }>();
  @Output() error = new EventEmitter<string>();

  onSubmit(e: Event) {
    try {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      
      const nameElement = form.elements.namedItem('name') as HTMLInputElement;
      const quantityElement = form.elements.namedItem('quantity') as HTMLInputElement;
      
      if (!nameElement || !quantityElement) {
        this.error.emit('Form elements not found');
        return;
      }

      const name = nameElement.value.trim();
      const quantity = Number(quantityElement.value) || DEFAULT_QUANTITY;
      
      if (!name) {
        this.error.emit('Item name is required');
        return;
      }
      
      if (quantity < MIN_QUANTITY) {
        this.error.emit('Quantity must be at least 1');
        return;
      }
      
      this.addItem.emit({ name, quantity });
      form.reset();
      quantityElement.value = DEFAULT_QUANTITY.toString();
    } catch (error) {
      this.error.emit('An error occurred while adding the item');
      console.error('Form submission error:', error);
    }
  }
}
