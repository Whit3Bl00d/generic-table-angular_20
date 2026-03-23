import { DatePipe } from '@angular/common';

// Core domain types
export type ItemType = 'general' | 'furniture';

export type DateRange = {
  start: Date;
  end: Date;
};

// Interface for household items (without methods)
export interface HouseholdItemInterface {
  id: string;
  name: string;
  quantity: number;
  type: ItemType;
  collectionDate?: Date | DateRange;
}

// Main domain entity implementing the interface
export class HouseholdItem implements HouseholdItemInterface {
  id: string;
  name: string;
  quantity: number;
  type: ItemType;
  collectionDate?: Date | DateRange;

  constructor(
    id: string,
    name: string,
    quantity: number,
    type: ItemType,
    collectionDate?: Date | DateRange
  ) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.type = type;
    this.collectionDate = collectionDate;
  }

  static isSameItem(a: HouseholdItem, b: HouseholdItem): boolean {
    return a.id === b.id;
  }

  static formatDate(item: HouseholdItem): string {
    const datePipe = new DatePipe('en-US');
    if (!item.collectionDate) return '';
    
    if (item.collectionDate instanceof Date) {
      return datePipe.transform(item.collectionDate, 'mediumDate') || '';
    }
    
    // Handle DateRange
    if (typeof item.collectionDate === 'object' && item.collectionDate !== null && 'start' in item.collectionDate && 'end' in item.collectionDate) {
      const dateRange = item.collectionDate as DateRange;
      const startDate = datePipe.transform(dateRange.start, 'mediumDate') || '';
      const endDate = datePipe.transform(dateRange.end, 'mediumDate') || '';
      return `${startDate} - ${endDate}`;
    }
    
    return '';
  }
}

// Utility function for ID generation
export function generateId(): string {
  return crypto.randomUUID();
}
