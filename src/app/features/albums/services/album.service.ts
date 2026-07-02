import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/api.config';
import {
  AlbumCardDto,
  AlbumDto,
  AlbumsSearchRequest,
  PagedAlbumCards,
  PagedAlbums,
  UpsertAlbumCardRequest,
  UpsertAlbumRequest,
} from '../models/album.model';
import { CardSearchRequest } from '../../cards/models/card-search.model';

@Injectable({ providedIn: 'root' })
export class AlbumService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getPublicAlbums(request: AlbumsSearchRequest, page: number, size: number): Observable<PagedAlbums> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (request.type) params = params.set('type', request.type);
    return this.http.get<PagedAlbums>(`${this.baseUrl}/albums/public`, { params });
  }

  getMyAlbums(request: AlbumsSearchRequest, page: number, size: number): Observable<PagedAlbums> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (request.type) params = params.set('type', request.type);
    return this.http.get<PagedAlbums>(`${this.baseUrl}/albums/my`, { params });
  }

  createAlbum(request: UpsertAlbumRequest): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/albums`, request);
  }

  getAlbum(albumId: number): Observable<AlbumDto> {
    return this.http.get<AlbumDto>(`${this.baseUrl}/albums/${albumId}`);
  }

  updateAlbum(albumId: number, request: UpsertAlbumRequest): Observable<AlbumDto> {
    return this.http.put<AlbumDto>(`${this.baseUrl}/albums/${albumId}`, request);
  }

  searchAlbumCards(
    albumId: number,
    request: CardSearchRequest,
    page: number,
    size: number,
  ): Observable<PagedAlbumCards> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<PagedAlbumCards>(
      `${this.baseUrl}/albums/${albumId}/cards/search`,
      request,
      { params },
    );
  }

  addCard(albumId: number, request: UpsertAlbumCardRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/albums/${albumId}/cards`, request);
  }

  updateCard(
    albumId: number,
    albumCardId: number,
    request: UpsertAlbumCardRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/albums/${albumId}/cards/${albumCardId}`,
      request,
    );
  }

  deleteCard(albumId: number, albumCardId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/albums/${albumId}/cards/${albumCardId}`);
  }

  up(albumId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/albums/${albumId}/up`, null);
  }

  deleteAlbum(albumId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/albums/${albumId}`);
  }

  migrate(): Observable<string> {
    return this.http.post(`${this.baseUrl}/albums/migrate`, null, { responseType: 'text' });
  }
}
