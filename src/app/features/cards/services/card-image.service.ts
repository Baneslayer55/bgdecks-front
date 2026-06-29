import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../../../shared/api.config';
import { Card } from '../../../shared/models/card.model';

@Injectable({ providedIn: 'root' })
export class CardImageService {
  private readonly baseUrl = inject(API_BASE_URL);

  getCardImageUrl(card: Card): string {
    const origin = new URL(this.baseUrl).origin;
    return `${origin}/images/cards/${card.setInfo.id}/${card.imageMd5}`;
  }
}
