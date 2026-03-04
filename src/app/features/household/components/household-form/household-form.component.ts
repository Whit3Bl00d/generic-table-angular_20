import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const quantity = Number((form.elements.namedItem('quantity') as HTMLInputElement).value) || 1;
    if (!name) return;
    this.addItem.emit({ name, quantity });
    form.reset();
    (form.elements.namedItem('quantity') as HTMLInputElement).value = '1';
  }
}
