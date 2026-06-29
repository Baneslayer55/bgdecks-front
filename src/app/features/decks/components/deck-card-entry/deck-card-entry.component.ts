import { Component, computed, inject, input } from '@angular/core';
import { CardImageService } from '../../../cards/services/card-image.service';
import { DeckCardDto } from '../../models/deck.model';
import { Card } from '../../../../shared/models/card.model';

@Component({
  selector: 'app-deck-card-entry',
  templateUrl: './deck-card-entry.component.html',
  host: { class: 'block' },
})
export class DeckCardEntryComponent {
  private readonly cardImageService = inject(CardImageService);
  readonly entry = input.required<DeckCardDto>();

  readonly imageUrl = computed(() =>
    this.cardImageService.getCardImageUrl(this.entry().card as Card),
  );
}
