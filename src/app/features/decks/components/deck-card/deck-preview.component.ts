import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../../../shared/api.config';
import { DeckPreviewDto } from '../../models/deck.model';
import { CardImageService } from '../../../cards/services/card-image.service';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';

@Component({
  selector: 'app-deck-card',
  imports: [UserProfileCompactComponent],
  templateUrl: './deck-preview.component.html',
  host: { class: 'block' },
})
export class DeckPreviewComponent {
  private readonly cardImageService = inject(CardImageService);
  private readonly router = inject(Router);
  readonly deck = input.required<DeckPreviewDto>();

  navigateToDeck(): void {
    this.router.navigate(['/decks', this.deck().id]);
  }

  get heroImageUrl(): string {
    const hero = this.deck().hero;
    return this.cardImageService.getCardImageUrl(hero)
  }

  get rating(): number {
    const reactions = this.deck().reactions ?? [];
    const likes = reactions.filter((r) => r.reactionType === 'LIKE').length;
    const dislikes = reactions.filter((r) => r.reactionType === 'DISLIKE').length;
    return likes - dislikes;
  }
}
