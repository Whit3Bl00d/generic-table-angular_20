export type DateRange = {
  start: Date;
  end: Date;
};

export enum SortDirection {
  ascending = 'asc',
  descending = 'desc',
}

export enum ODataOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'ge',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'le',
  
  // Logical Operators
  LOGICAL_AND = 'and',
  LOGICAL_OR = 'or',
  LOGICAL_NOT = 'not',

  // String Functions (SAP v2 uses substringof, SAP v4 uses contains)
  CONTAINS = 'contains',
  SUBSTRING_OF = 'substringof',
  STARTS_WITH = 'startswith',
  ENDS_WITH = 'endswith',
  
  // SAP-specific / Advanced
  IN_COLLECTION = 'in',
  ANY = 'any',
  ALL = 'all'
}

export interface SortParams<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface FilterCriterion<T> {
  key: keyof T;
  value: any;
  operator: ODataOperator;
}


