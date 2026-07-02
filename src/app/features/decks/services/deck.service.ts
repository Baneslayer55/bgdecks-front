import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/api.config';
import {
  CardDto,
  CreateDeckRequest,
  DeckDto,
  DeckFormatDto,
  DeckSearchRequest,
  PagedDecks,
  UpdateDeckCardsRequest,
  UpdateDeckInfoRequest,
} from '../models/deck.model';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getMyDecks(request: DeckSearchRequest, page: number, size: number): Observable<PagedDecks> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<PagedDecks>(`${this.baseUrl}/decks/my`, request, { params });
  }

  getPublicDecks(request: DeckSearchRequest, page: number, size: number): Observable<PagedDecks> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<PagedDecks>(`${this.baseUrl}/decks/public`, request, { params });
  }

  getFormats(): Observable<DeckFormatDto[]> {
    return this.http.get<DeckFormatDto[]>(`${this.baseUrl}/decks/formats`);
  }

  autocomplete(name: string, searchMode: 'HEROES' | 'NON_HEROES' | 'ALL'): Observable<CardDto[]> {
    const params = new HttpParams().set('name', name).set('searchMode', searchMode);
    return this.http.get<CardDto[]>(`${this.baseUrl}/cards/autocomplete`, { params });
  }

  getDeck(id: number): Observable<DeckDto> {
    return this.http.get<DeckDto>(`${this.baseUrl}/decks/${id}`);
  }

  createDeck(request: CreateDeckRequest): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/decks`, request);
  }

  updateDeckCards(deckId: number, request: UpdateDeckCardsRequest): Observable<DeckDto> {
    return this.http.put<DeckDto>(`${this.baseUrl}/decks/${deckId}/cards`, request);
  }

  updateDeckInfo(deckId: number, request: UpdateDeckInfoRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/decks/${deckId}/info`, request);
  }

  deleteDeck(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/decks/${id}`);
  }

  likeDeck(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/decks/${id}/like`, null);
  }
}
