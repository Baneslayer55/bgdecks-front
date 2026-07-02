import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CardDto } from '../models/card.model';

export interface UpdateCardParamsRequest {
  type: string;
  cost?: number | null;
  attack?: number | null;
  health?: number | null;
  text?: string;
  bannedIn?: string[];
  classes?: string[];
  elements?: string[];
}

export interface UpdateCardRequest {
  number: number;
  setId: number;
  isFoil: boolean;
  rarity?: string;
  variant?: string;
  artistId?: number | null;
  artistNickname?: string;
  params: UpdateCardParamsRequest;
}

@Injectable({ providedIn: 'root' })
export class CardEditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  updateCard(cardId: number, request: UpdateCardRequest, image?: File): Observable<CardDto> {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.put<CardDto>(`${this.baseUrl}/cards/${cardId}`, formData);
  }

  renameCard(oldName: string, newName: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/cards/rename`, { oldName, newName });
  }
}
