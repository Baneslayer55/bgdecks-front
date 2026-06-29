import { CardDto } from '../../../shared/models/card.model';

export type { CardDto } from '../../../shared/models/card.model';

export interface DeckFormatDto {
  id: number;
  name: string;
  description: string;
  isPublicFormat: boolean;
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
  hero: CardDto | null;
  owner: UserProfileDto;
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

export interface DeckCardDto {
  card: CardDto;
  position: 'MAIN' | 'SIDEBOARD' | 'MAYBEBOARD';
  cardsCount: number;
}

export interface DeckDto extends DeckPreviewDto {
  cards: DeckCardDto[];
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

export interface UpdateDeckCardItem {
  cardId: number;
  position: 'MAIN' | 'SIDEBOARD' | 'MAYBEBOARD';
  cardsCount: number;
}

export interface UpdateDeckCardsRequest {
  heroId: number;
  cards: UpdateDeckCardItem[];
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
