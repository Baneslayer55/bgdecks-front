import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/api.config';
import { ArtistDto, SetInfoDto } from '../../../shared/models/card.model';
import {
  CardDto,
  CardClass,
  CardSearchRequest,
  PagedResponse,
} from '../models/card-search.model';

@Injectable({ providedIn: 'root' })
export class CardSearchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  search(request: CardSearchRequest, page: number, size: number): Observable<PagedResponse<CardDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<PagedResponse<CardDto>>(`${this.baseUrl}/cards/search`, request, { params });
  }

  getSets(): Observable<SetInfoDto[]> {
    return this.http.get<SetInfoDto[]>(`${this.baseUrl}/cards/sets`);
  }

  getClasses(): Observable<CardClass[]> {
    return this.http.get<CardClass[]>(`${this.baseUrl}/cards/classes`);
  }

  getArtists(): Observable<ArtistDto[]> {
    return this.http.get<ArtistDto[]>(`${this.baseUrl}/cards/artists`);
  }
}
