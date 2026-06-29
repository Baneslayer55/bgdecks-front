import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardImageService } from '../../../cards/services/card-image.service';
import { DeckService } from '../../services/deck.service';
import { DeckCardDto, DeckDto } from '../../models/deck.model';
import { Card } from '../../../../shared/models/card.model';
import { DeckCardEntryComponent } from '../../components/deck-card-entry/deck-card-entry.component';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';

@Component({
  selector: 'app-deck-detail',
  imports: [ProgressSpinnerModule, DeckCardEntryComponent, UserProfileCompactComponent],
  templateUrl: './deck-detail.component.html',
})
export class DeckDetailComponent {
  private readonly deckService = inject(DeckService);
  private readonly cardImageService = inject(CardImageService);

  readonly deckId = input<string>();

  readonly deck = signal<DeckDto | null>(null);
  readonly loading = signal(false);
  readonly hasError = signal(false);

  readonly heroImageUrl = computed(() => {
    const hero = this.deck()?.hero;
    return hero ? this.cardImageService.getCardImageUrl(hero as Card) : '';
  });

  readonly mainCards = computed<DeckCardDto[]>(() =>
    this.deck()?.cards.filter((c) => c.position === 'MAIN') ?? [],
  );
  readonly sideboardCards = computed<DeckCardDto[]>(() =>
    this.deck()?.cards.filter((c) => c.position === 'SIDEBOARD') ?? [],
  );
  readonly maybeboardCards = computed<DeckCardDto[]>(() =>
    this.deck()?.cards.filter((c) => c.position === 'MAYBEBOARD') ?? [],
  );

  constructor() {
    effect(() => {
      const id = this.deckId();
      if (id) this.loadDeck(+id);
    });
  }

  loadDeck(id: number): void {
    this.loading.set(true);
    this.hasError.set(false);
    this.deckService.getDeck(id).subscribe({
      next: (deck) => {
        this.deck.set(deck);
        this.loading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.loading.set(false);
      },
    });
  }
}
