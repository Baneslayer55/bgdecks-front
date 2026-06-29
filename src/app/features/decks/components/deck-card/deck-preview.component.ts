import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DeckPreviewDto } from '../../models/deck.model';
import { CardImageService } from '../../../cards/services/card-image.service';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { DeckService } from '../../services/deck.service';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';

@Component({
  selector: 'app-deck-card',
  imports: [UserProfileCompactComponent, DialogModule, ButtonModule],
  templateUrl: './deck-preview.component.html',
  host: { class: 'block' },
})
export class DeckPreviewComponent {
  private readonly cardImageService = inject(CardImageService);
  private readonly authService = inject(AuthService);
  private readonly deckService = inject(DeckService);
  private readonly router = inject(Router);

  readonly deck = input.required<DeckPreviewDto>();
  readonly deleted = output<void>();

  readonly isOwner = computed(() => this.authService.isCurrentUser(this.deck().owner.userId));
  readonly confirmVisible = signal(false);
  readonly deleting = signal(false);

  navigateToDeck(): void {
    this.router.navigate(['/decks', this.deck().id]);
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.confirmVisible.set(true);
  }

  confirmDelete(): void {
    this.deleting.set(true);
    this.deckService.deleteDeck(this.deck().id).subscribe({
      next: () => {
        this.confirmVisible.set(false);
        this.deleting.set(false);
        this.deleted.emit();
      },
      error: () => this.deleting.set(false),
    });
  }

  get heroImageUrl(): string {
    const hero = this.deck().hero;
    return this.cardImageService.getCardImageUrl(hero);
  }

  get rating(): number {
    const reactions = this.deck().reactions ?? [];
    const likes = reactions.filter((r) => r.reactionType === 'LIKE').length;
    const dislikes = reactions.filter((r) => r.reactionType === 'DISLIKE').length;
    return likes - dislikes;
  }
}
