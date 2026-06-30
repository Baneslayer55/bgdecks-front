import { UserProfileDto } from '../../decks/models/deck.model';
import { CardDto } from '../../../shared/models/card.model';

export type { UserProfileDto } from '../../decks/models/deck.model';
export type { CardDto } from '../../../shared/models/card.model';

export type AlbumType = 'HAVE_LIST' | 'WISH_LIST' | 'COLLECTION';
export type AlbumCardCondition = 'NM' | 'SP' | 'HP' | 'DM' | 'LIST';

export interface AlbumDto {
  id: number;
  owner: UserProfileDto;
  name: string;
  isPublic: boolean;
  description: string;
  type: AlbumType;
  cardsCount: number;
  created: string;
  updated: string | null;
}

export interface AlbumCardDto {
  id: number;
  card: CardDto;
  cardsCount: number;
  condition: AlbumCardCondition;
  price: number | null;
}

export interface UpsertAlbumRequest {
  name: string;
  isPublic: boolean;
  description: string;
  type: AlbumType;
}

export interface UpsertAlbumCardRequest {
  cardId: number;
  cardsCount: number;
  condition: AlbumCardCondition;
  price?: number;
}

export interface AlbumsSearchRequest {
  type?: AlbumType;
}

export interface PagedAlbums {
  content: AlbumDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PagedAlbumCards {
  content: AlbumCardDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const ALBUM_TYPE_LABELS: Record<AlbumType, string> = {
  HAVE_LIST: 'Есть в наличии',
  WISH_LIST: 'Вишлист',
  COLLECTION: 'Коллекция',
};

export function isAlbumOutdated(updated: string | null): boolean {
  if (!updated) return true;
  return Date.now() - new Date(updated).getTime() > 3 * 24 * 60 * 60 * 1000;
}

export const ALBUM_CONDITION_LABELS: Record<AlbumCardCondition, string> = {
  NM: 'NM',
  SP: 'SP',
  HP: 'HP',
  DM: 'DM',
  LIST: 'По списку',
};
