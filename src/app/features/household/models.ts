import { DatePipe } from '@angular/common';

export type ItemType = 'general' | 'furniture';

export type DateRange = {
  start: Date;
  end: Date;
};

export class HouseholdItem {
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

export const FURNITURE_TYPES = [
  'Chair',
  'Table',
  'Sofa',
  'Bed',
  'Wardrobe',
  'Desk',
  'Bookshelf',
  'Cabinet',
  'Dresser',
  'Nightstand',
  'Coffee Table',
  'TV Stand',
  'Ottoman',
  'Bench',
  'Recliner'
] as const;

export type FurnitureType = typeof FURNITURE_TYPES[number];

export function generateId(): string {
  return crypto.randomUUID();
}
