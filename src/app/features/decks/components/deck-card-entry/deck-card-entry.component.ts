import { Component, input } from '@angular/core';
import { DeckCardDto } from '../../models/deck.model';
import { CardImageComponent } from '../../../../shared/components/card-image/card-image.component';

@Component({
  selector: 'app-deck-card-entry',
  imports: [CardImageComponent],
  templateUrl: './deck-card-entry.component.html',
  host: { class: 'block' },
})
export class DeckCardEntryComponent {
  readonly entry = input.required<DeckCardDto>();
  readonly deckFormat = input<string | null>(null);
}
