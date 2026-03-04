import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FURNITURE_TYPES, type FurnitureType } from '../../models';

const DEFAULT_COUNT = 1;
const MIN_COUNT = 1;
const MAX_COUNT = 99;

@Component({
  selector: 'app-furniture-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './furniture-form.component.html',
  styleUrls: ['./furniture-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FurnitureFormComponent {
  @Output() addFurniture = new EventEmitter<{ furniture: FurnitureType; count: number }>();
  @Output() error = new EventEmitter<string>();

  readonly furnitureTypes = FURNITURE_TYPES;

  onSubmit(e: Event) {
    try {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      
      const furnitureElement = form.elements.namedItem('furniture') as HTMLSelectElement;
      const countElement = form.elements.namedItem('count') as HTMLInputElement;
      
      if (!furnitureElement || !countElement) {
        this.error.emit('Form elements not found');
        return;
      }

      const furniture = furnitureElement.value as FurnitureType;
      const count = Number(countElement.value) || DEFAULT_COUNT;
      
      if (!furniture) {
        this.error.emit('Please select a furniture type');
        return;
      }
      
      if (count < MIN_COUNT || count > MAX_COUNT) {
        this.error.emit(`Count must be between ${MIN_COUNT} and ${MAX_COUNT}`);
        return;
      }
      
      this.addFurniture.emit({ furniture, count });
      form.reset();
      countElement.value = DEFAULT_COUNT.toString();
    } catch (error) {
      this.error.emit('An error occurred while adding the furniture');
      console.error('Furniture form submission error:', error);
    }
  }
}
