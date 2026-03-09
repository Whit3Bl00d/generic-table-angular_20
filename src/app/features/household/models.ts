export type ItemType = 'general' | 'furniture';

export interface HouseholdItem {
  id: string;
  name: string;
  quantity: number;
  type: ItemType;
  collectionDate?: Date;
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
