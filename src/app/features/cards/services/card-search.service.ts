import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API_BASE_URL } from '../../../shared/api.config';
import { ArtistDto, FormatDto, SetInfoDto } from '../../../shared/models/card.model';
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

  private sets$?: Observable<SetInfoDto[]>;
  private classes$?: Observable<CardClass[]>;
  private artists$?: Observable<ArtistDto[]>;
  private formats$?: Observable<FormatDto[]>;

  search(request: CardSearchRequest, page: number, size: number): Observable<PagedResponse<CardDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<PagedResponse<CardDto>>(`${this.baseUrl}/cards/search`, request, { params });
  }

  getSets(): Observable<SetInfoDto[]> {
    this.sets$ ??= this.http.get<SetInfoDto[]>(`${this.baseUrl}/cards/sets`).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.sets$;
  }

  getClasses(): Observable<CardClass[]> {
    this.classes$ ??= this.http.get<CardClass[]>(`${this.baseUrl}/cards/classes`).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.classes$;
  }

  getArtists(): Observable<ArtistDto[]> {
    this.artists$ ??= this.http.get<ArtistDto[]>(`${this.baseUrl}/cards/artists`).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.artists$;
  }

  getFormats(): Observable<FormatDto[]> {
    this.formats$ ??= this.http.get<FormatDto[]>(`${this.baseUrl}/decks/formats`).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.formats$;
  }
}
