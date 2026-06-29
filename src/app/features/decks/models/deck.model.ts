import { SetInfoDto } from '../../../shared/models/card.model';

export interface CardShortDto {
  id: number;
  name: string;
  number: number;
  variant: string;
  isFoil: boolean;
  setInfo: SetInfoDto;
}

export interface DeckFormatDto {
  id: number;
  name: string;
  description: string;
  isPublicFormat: boolean;
}

export interface CardDto {
  id: number;
  name: string;
  rarity?: string;
  number?: number;
  variant?: string;
  isFoil?: boolean;
  isLimited?: boolean;
  imageMd5: string;
  setInfo: SetInfoDto;
}

export interface UserProfileDto {
  id: number;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  city?: string;
  avatarId?: string;
}

export interface ReactionDto {
  userId: string;
  reactionType: 'LIKE' | 'DISLIKE';
}

export interface DeckValidationDto {
  isValid: boolean;
  message: string;
}

export interface DeckPreviewDto {
  id: number;
  name: string;
  hero: CardDto;
  ownerId: UserProfileDto;
  isPublic: boolean;
  isValid: boolean;
  views: number;
  rating: number;
  created: string;
  updated: string;
  mainCardsTotal: number;
  sideboardCardsTotal: number;
  format: DeckFormatDto;
  reactions: ReactionDto[];
  validation: DeckValidationDto[];
}

export interface CreateDeckRequest {
  deckName: string;
  isPublic: boolean;
  formatId: number;
}

export interface DeckSearchRequest {
  heroId?: number;
  deckCardId?: number;
  folderId?: number;
  formatId?: number;
  heroElements?: string[];
}

export interface PagedDecks {
  content: DeckPreviewDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
