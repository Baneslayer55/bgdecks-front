import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DeckPreviewDto } from '../../models/deck.model';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { DeckService } from '../../services/deck.service';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';
import { CardImageComponent } from '../../../../shared/components/card-image/card-image.component';
import { DeckStatsComponent } from '../deck-stats/deck-stats.component';

@Component({
  selector: 'app-deck-card',
  imports: [RouterLink, UserProfileCompactComponent, DialogModule, ButtonModule, CardImageComponent, DeckStatsComponent],
  templateUrl: './deck-preview.component.html',
  host: { class: 'block' },
})
export class DeckPreviewComponent {
  private readonly authService = inject(AuthService);
  private readonly deckService = inject(DeckService);

  readonly deck = input.required<DeckPreviewDto>();
  readonly deleted = output<void>();

  readonly isOwner = computed(() => this.authService.isCurrentUser(this.deck().owner.userId));
  readonly confirmVisible = signal(false);
  readonly deleting = signal(false);

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

}
