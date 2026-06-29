export type { CardDto, ArtistDto, SetInfoDto, CardParamsDto } from '../../../shared/models/card.model';

export type Operator = 'GT' | 'LS' | 'EQ' | 'GQ' | 'LQ';

export interface RangeFilter {
  operator: Operator;
  value: number;
}

export type FoilCriteria = 'ALL' | 'ONLY_FOIL' | 'NON_FOIL';
export type PfCriteria = 'ALL' | 'ONLY_PF' | 'NON_PF';
export type MultiElementCriteria = 'ALL' | 'SINGLE_ELEMENT' | 'MULTI_ELEMENT' | 'EXACT_ELEMENTS';

export interface CardSearchRequest {
  name?: string;
  text?: string;
  setIds?: number[];
  rarities?: string[];
  elements?: string[];
  types?: string[];
  classes?: string[];
  artisIds?: number[];
  foilCriteria?: FoilCriteria;
  pfCriteria?: PfCriteria;
  multiElementCriteria?: MultiElementCriteria;
  isStandard?: boolean;
  latestVersionsOnly?: boolean;
  noAbilities?: boolean;
  costFilter?: RangeFilter;
  attackFilter?: RangeFilter;
  healthFilter?: RangeFilter;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CardClass {
  id: string;
  name: string;
}

export interface ImageFilterOption {
  file: string;
  value: string;
  label: string;
}

export interface TextHelper {
  file: string;
  token: string;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}
