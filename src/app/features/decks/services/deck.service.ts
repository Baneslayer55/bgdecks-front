import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CARDS_API_BASE_URL } from '../../../shared/api.config';
import {
  CardShortDto,
  CreateDeckRequest,
  DeckFormatDto,
  DeckSearchRequest,
  PagedDecks,
} from '../models/deck.model';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(CARDS_API_BASE_URL);

  getMyDecks(request: DeckSearchRequest, page: number, size: number): Observable<PagedDecks> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<PagedDecks>(`${this.baseUrl}/decks/my`, request, { params });
  }

  getFormats(): Observable<DeckFormatDto[]> {
    return this.http.get<DeckFormatDto[]>(`${this.baseUrl}/decks/formats`);
  }

  autocomplete(name: string, searchMode: 'HEROES' | 'NON_HEROES'): Observable<CardShortDto[]> {
    const params = new HttpParams().set('name', name).set('searchMode', searchMode);
    return this.http.get<CardShortDto[]>(`${this.baseUrl}/cards/autocomplete`, { params });
  }

  createDeck(request: CreateDeckRequest): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/decks`, request);
  }
}
