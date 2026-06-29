import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../api.config';
import { CardDto } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardImageService {
  private readonly baseUrl = inject(API_BASE_URL);

  getCardImageUrl(card: CardDto | null): string {
    const origin = new URL(this.baseUrl).origin;
    if (!card) {
      return `${origin}/images/cards/unknown_card.png`;
    }
    return `${origin}/images/cards/${card.setInfo.id}/${card.imageMd5}`;
  }
}
