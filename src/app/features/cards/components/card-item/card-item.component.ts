import { Component, inject, input } from '@angular/core';
import { Card } from '../../../../shared/models/card.model';
import { CardImageService } from '../../services/card-image.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  host: { class: 'block' },
})
export class CardItemComponent {
  private readonly cardImageService = inject(CardImageService);
  readonly card = input.required<Card>();

  get imageUrl(): string {
    return this.cardImageService.getCardImageUrl(this.card());
  }
}
