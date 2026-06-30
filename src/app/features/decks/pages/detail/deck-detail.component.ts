import { Component, HostListener, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { DeckService } from '../../services/deck.service';
import { CardDto, DeckCardDto, DeckDto, UpdateDeckCardItem } from '../../models/deck.model';
import { CardBrowserPanelComponent, CardAddedEvent } from '../../components/card-browser-panel/card-browser-panel.component';
import { DeckCardEntryComponent } from '../../components/deck-card-entry/deck-card-entry.component';
import { EditCardTileComponent } from '../../components/edit-card-tile/edit-card-tile.component';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';
import { CardAutocompleteComponent } from '../../../../shared/components/card-autocomplete/card-autocomplete.component';
import { CardImageComponent } from '../../../../shared/components/card-image/card-image.component';
import { DeckStatsPanelComponent } from '../../components/deck-stats-panel/deck-stats-panel.component';
import { DeckExportComponent } from '../../components/deck-export/deck-export.component';
import { EditDeckInfoDialogComponent } from '../../components/edit-deck-info-dialog/edit-deck-info-dialog.component';

type Position = 'MAIN' | 'SIDEBOARD' | 'MAYBEBOARD';

const LIST_IDS: Record<Position, string> = {
  MAIN: 'edit-main-list',
  SIDEBOARD: 'edit-sideboard-list',
  MAYBEBOARD: 'edit-maybeboard-list',
};

@Component({
  selector: 'app-deck-detail',
  imports: [
    ProgressSpinnerModule,
    ButtonModule,
    DragDropModule,
    DeckCardEntryComponent,
    EditCardTileComponent,
    UserProfileCompactComponent,
    CardAutocompleteComponent,
    CardBrowserPanelComponent,
    CardImageComponent,
    DeckStatsPanelComponent,
    DeckExportComponent,
    EditDeckInfoDialogComponent,
  ],
  templateUrl: './deck-detail.component.html',
})
export class DeckDetailComponent {
  private readonly deckService = inject(DeckService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly deckId = input<string>();
  readonly edit = input<string>();

  readonly deck = signal<DeckDto | null>(null);
  readonly loading = signal(false);
  readonly hasError = signal(false);

  // edit mode state
  readonly editMode = signal(false);
  readonly showInfoDialog = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal(false);
  readonly editHeroId = signal<number | null>(null);
  readonly editHeroCard = signal<DeckCardDto['card'] | null>(null);
  readonly editMain = signal<DeckCardDto[]>([]);
  readonly editSideboard = signal<DeckCardDto[]>([]);
  readonly editMaybeboard = signal<DeckCardDto[]>([]);
  readonly editHeroError = signal(false);
  readonly isDirty = signal(false);
  readonly addMainTrigger = signal(0);
  readonly addSideboardTrigger = signal(0);
  readonly addMaybeTrigger = signal(0);
  readonly heroResetTrigger = signal(0);

  readonly isMobile = signal(window.innerWidth < 768);

  readonly mainGridCols = computed(() =>
    this.isMobile()
      ? 'repeat(auto-fit, minmax(120px, 150px))'
      : 'repeat(auto-fit, minmax(160px, 200px))',
  );
  readonly maybeGridCols = computed(() =>
    this.isMobile()
      ? 'repeat(auto-fill, minmax(120px, 135px))'
      : 'repeat(auto-fill, minmax(160px, 180px))',
  );
  readonly sideboardGridCols = computed(() =>
    this.isMobile()
      ? 'repeat(auto-fill, minmax(120px, 150px))'
      : 'repeat(auto-fill, minmax(160px, 200px))',
  );

  @HostListener('window:resize')
  onWindowResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  private readonly change$ = new Subject<void>();

  readonly deckFormatName = computed(() => this.deck()?.format?.name ?? null);
  readonly validationErrors = computed(() =>
    this.deck()?.validations?.filter((v) => !v.isValid) ?? [],
  );

  readonly isOwner = computed(() => {
    const d = this.deck();
    return d ? this.authService.isCurrentUser(d.owner.userId) : false;
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

  readonly mainCardsTotal       = computed(() => this.mainCards().reduce((s, e) => s + e.cardsCount, 0));
  readonly sideboardCardsTotal  = computed(() => this.sideboardCards().reduce((s, e) => s + e.cardsCount, 0));
  readonly maybeboardCardsTotal = computed(() => this.maybeboardCards().reduce((s, e) => s + e.cardsCount, 0));

  readonly editMainTotal       = computed(() => this.editMain().reduce((s, e) => s + e.cardsCount, 0));
  readonly editSideboardTotal  = computed(() => this.editSideboard().reduce((s, e) => s + e.cardsCount, 0));
  readonly editMaybeTotal      = computed(() => this.editMaybeboard().reduce((s, e) => s + e.cardsCount, 0));


  readonly listIds = LIST_IDS;

  constructor() {
    effect(() => {
      const id = this.deckId();
      if (id) this.loadDeck(+id);
    });

    this.change$
      .pipe(debounceTime(5000), takeUntilDestroyed())
      .subscribe(() => {
        if (this.isDirty() && this.editMode() && !this.saving()) {
          this.saveEdits();
        }
      });
  }

  loadDeck(id: number): void {
    this.loading.set(true);
    this.hasError.set(false);
    this.deckService.getDeck(id).subscribe({
      next: (deck) => {
        this.deck.set(deck);
        this.loading.set(false);
        if (this.edit() === 'true' && this.authService.isCurrentUser(deck.owner.userId)) {
          this.enterEditMode();
        }
      },
      error: () => {
        this.hasError.set(true);
        this.loading.set(false);
      },
    });
  }

  enterEditMode(): void {
    const d = this.deck();
    if (!d) return;
    this.editHeroId.set(d.hero?.id ?? null);
    this.editHeroCard.set(d.hero);
    this.editMain.set(d.cards.filter((c) => c.position === 'MAIN').map((c) => ({ ...c })));
    this.editSideboard.set(d.cards.filter((c) => c.position === 'SIDEBOARD').map((c) => ({ ...c })));
    this.editMaybeboard.set(d.cards.filter((c) => c.position === 'MAYBEBOARD').map((c) => ({ ...c })));
    this.heroResetTrigger.set(0);
    this.editHeroError.set(false);
    this.saveError.set(false);
    this.isDirty.set(false);
    this.editMode.set(true);
  }

  openInfoDialog(): void {
    this.showInfoDialog.set(true);
  }

  onInfoSaved(): void {
    const id = this.deckId();
    if (!id) return;
    this.deckService.getDeck(+id).subscribe({
      next: (deck) => this.deck.set(deck),
    });
  }

  cancelEdit(): void {
    this.isDirty.set(false);
    this.editMode.set(false);
    this.router.navigate([], { queryParams: { edit: null }, queryParamsHandling: 'merge' });
  }

  saveEdits(): void {
    const heroId = this.editHeroId();
    const deckId = this.deckId();
    if (!heroId || !deckId) return;

    const cards: UpdateDeckCardItem[] = [
      ...this.editMain().map((e) => ({ cardId: e.card.id, position: 'MAIN' as const, cardsCount: e.cardsCount })),
      ...this.editSideboard().map((e) => ({ cardId: e.card.id, position: 'SIDEBOARD' as const, cardsCount: e.cardsCount })),
      ...this.editMaybeboard().map((e) => ({ cardId: e.card.id, position: 'MAYBEBOARD' as const, cardsCount: e.cardsCount })),
    ];

    this.saving.set(true);
    this.saveError.set(false);
    this.deckService.updateDeckCards(+deckId, { heroId, cards }).subscribe({
      next: () => {
        this.isDirty.set(false);
        this.deckService.getDeck(+deckId).subscribe({
          next: (fresh) => {
            this.deck.set(fresh);
            this.saving.set(false);
          },
          error: () => this.saving.set(false),
        });
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set(true);
      },
    });
  }

  onHeroSelected(card: CardDto | null): void {
    if (!card) return;
    this.editHeroError.set(false);
    this.editHeroId.set(card.id);
    this.editHeroCard.set(card);
    this.markDirty();
  }

  addCard(card: CardDto | null, position: Position): void {
    if (!card) return;
    const sig = this.sectionSignal(position);
    const existing = sig().find((e) => e.card.id === card.id);
    if (existing) {
      sig.update((arr) => arr.map((e) => (e.card.id === card.id ? { ...e, cardsCount: e.cardsCount + 1 } : e)));
    } else {
      sig.update((arr) => [...arr, { card, position, cardsCount: 1 }]);
    }
    if (position === 'MAIN') this.addMainTrigger.update((v) => v + 1);
    else if (position === 'SIDEBOARD') this.addSideboardTrigger.update((v) => v + 1);
    else this.addMaybeTrigger.update((v) => v + 1);
    this.markDirty();
  }

  removeCard(cardId: number, position: Position): void {
    this.sectionSignal(position).update((arr) => arr.filter((e) => e.card.id !== cardId));
    this.markDirty();
  }

  adjustCount(cardId: number, position: Position, delta: number): void {
    this.sectionSignal(position).update((arr) =>
      arr.map((e) => (e.card.id === cardId ? { ...e, cardsCount: Math.max(1, e.cardsCount + delta) } : e)),
    );
    this.markDirty();
  }

  onDrop(event: CdkDragDrop<DeckCardDto[]>): void {
    const prevPos = this.listIdToPosition(event.previousContainer.id);
    const currPos = this.listIdToPosition(event.container.id);
    if (prevPos === currPos) {
      const arr = [...this.sectionSignal(prevPos)()];
      moveItemInArray(arr, event.previousIndex, event.currentIndex);
      this.sectionSignal(prevPos).set(arr);
    } else {
      const src = [...this.sectionSignal(prevPos)()];
      const dst = [...this.sectionSignal(currPos)()];
      const [moved] = src.splice(event.previousIndex, 1);
      const existingIdx = dst.findIndex((e) => e.card.id === moved.card.id);
      if (existingIdx >= 0) {
        dst[existingIdx] = { ...dst[existingIdx], cardsCount: dst[existingIdx].cardsCount + moved.cardsCount };
      } else {
        dst.splice(event.currentIndex, 0, { ...moved, position: currPos });
      }
      this.sectionSignal(prevPos).set(src);
      this.sectionSignal(currPos).set(dst);
    }
    this.markDirty();
  }

  onCardAdded(event: CardAddedEvent): void {
    this.addCard(event.card, event.position);
  }

  private markDirty(): void {
    this.isDirty.set(true);
    this.change$.next();
  }

  private sectionSignal(position: Position) {
    if (position === 'SIDEBOARD') return this.editSideboard;
    if (position === 'MAYBEBOARD') return this.editMaybeboard;
    return this.editMain;
  }

  private listIdToPosition(id: string): Position {
    if (id === LIST_IDS.SIDEBOARD) return 'SIDEBOARD';
    if (id === LIST_IDS.MAYBEBOARD) return 'MAYBEBOARD';
    return 'MAIN';
  }

  private setSection(listId: string, cards: DeckCardDto[]): void {
    if (listId === LIST_IDS.MAIN) this.editMain.set(cards);
    else if (listId === LIST_IDS.SIDEBOARD) this.editSideboard.set(cards);
    else if (listId === LIST_IDS.MAYBEBOARD) this.editMaybeboard.set(cards);
  }
}
