import { Component, inject, input } from '@angular/core';
import { CARDS_API_BASE_URL } from '../../../../shared/api.config';
import { DeckPreviewDto } from '../../models/deck.model';

@Component({
  selector: 'app-deck-card',
  templateUrl: './deck-card.component.html',
  host: { class: 'block' },
})
export class DeckCardComponent {
  private readonly baseUrl = inject(CARDS_API_BASE_URL);
  readonly deck = input.required<DeckPreviewDto>();

  get heroImageUrl(): string {
    const hero = this.deck().hero;
    const origin = new URL(this.baseUrl).origin;
    return `${origin}/images/cards/${hero.setInfo.id}/${hero.imageMd5}`;
  }

  get rating(): number {
    const reactions = this.deck().reactions ?? [];
    const likes = reactions.filter((r) => r.reactionType === 'LIKE').length;
    const dislikes = reactions.filter((r) => r.reactionType === 'DISLIKE').length;
    return likes - dislikes;
  }
}
