import { Component, computed, inject, input, signal } from '@angular/core';
import { DeckPreviewDto } from '../../models/deck.model';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { DeckService } from '../../services/deck.service';

@Component({
  selector: 'app-deck-stats',
  templateUrl: './deck-stats.component.html',
})
export class DeckStatsComponent {
  private readonly authService = inject(AuthService);
  private readonly deckService = inject(DeckService);

  readonly deck = input.required<DeckPreviewDto>();

  readonly isAuthenticated = this.authService.isAuthenticated;

  private readonly likeOverride = signal<boolean | null>(null);

  readonly isLiked = computed(() => {
    const override = this.likeOverride();
    if (override !== null) return override;
    const userId = this.authService.getUserId();
    if (!userId) return false;
    return this.deck().likedUserIds.includes(userId);
  });

  readonly likeCount = computed(() => {
    const base = this.deck().likedUserIds.length;
    const override = this.likeOverride();
    if (override === null) return base;
    const userId = this.authService.getUserId() ?? '';
    const wasLiked = this.deck().likedUserIds.includes(userId);
    if (override && !wasLiked) return base + 1;
    if (!override && wasLiked) return base - 1;
    return base;
  });

  toggleLike(): void {
    if (!this.isAuthenticated()) return;
    const prevLiked = this.isLiked();
    this.likeOverride.set(!prevLiked);
    this.deckService.likeDeck(this.deck().id).subscribe({
      error: () => this.likeOverride.set(prevLiked),
    });
  }
}
