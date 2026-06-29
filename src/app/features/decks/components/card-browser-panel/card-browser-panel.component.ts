import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardSearchService } from '../../../cards/services/card-search.service';
import { CardFiltersComponent } from '../../../cards/components/card-filters/card-filters.component';
import { CardItemComponent } from '../../../cards/components/card-item/card-item.component';
import { CardDto, CardSearchRequest } from '../../../cards/models/card-search.model';

export interface CardAddedEvent {
  card: CardDto;
  position: 'MAIN' | 'SIDEBOARD' | 'MAYBEBOARD';
}

interface LastAdded {
  cardId: number;
  position: 'MAIN' | 'SIDEBOARD' | 'MAYBEBOARD';
}

const PAGE_SIZE = 60;

@Component({
  selector: 'app-card-browser-panel',
  imports: [NgTemplateOutlet, PaginatorModule, ProgressSpinnerModule, CardFiltersComponent, CardItemComponent],
  templateUrl: './card-browser-panel.component.html',
})
export class CardBrowserPanelComponent implements OnInit, OnDestroy {
  private readonly cardSearchService = inject(CardSearchService);
  private readonly searchTrigger$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();
  private lastAddedTimeout?: ReturnType<typeof setTimeout>;

  readonly cardAdded = output<CardAddedEvent>();

  readonly panelOpen         = signal(false);
  readonly panelHeight       = signal(Math.round(window.innerHeight * 0.5));
  readonly loading           = signal(false);
  readonly cards             = signal<CardDto[]>([]);
  readonly totalElements     = signal(0);
  readonly page              = signal(0);
  readonly isMobile          = signal(window.innerWidth < 768);
  readonly mobileShowFilters = signal(false);
  readonly lastAdded         = signal<LastAdded | null>(null);
  readonly cardGridCols      = computed(() =>
    `repeat(auto-fill, minmax(${this.isMobile() ? 130 : 175}px, 1fr))`,
  );

  readonly pageSize = PAGE_SIZE;

  private currentFilters: CardSearchRequest = {};
  private resizeDragging = false;
  private resizeDragStartY = 0;
  private resizeDragStartHeight = 0;

  @HostListener('window:resize')
  onWindowResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  ngOnInit(): void {
    this.searchTrigger$
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page.set(0);
        this.search();
      });
  }

  ngOnDestroy(): void {
    clearTimeout(this.lastAddedTimeout);
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.panelOpen.update((v) => !v);
    if (this.panelOpen()) {
      if (this.cards().length === 0) {
        this.search();
      }
    } else {
      this.mobileShowFilters.set(false);
    }
  }

  onFiltersChange(req: CardSearchRequest): void {
    this.currentFilters = req;
    this.searchTrigger$.next();
  }

  search(): void {
    this.loading.set(true);
    this.cardSearchService.search(this.currentFilters, this.page(), this.pageSize).subscribe({
      next: (res) => {
        this.cards.set(res.content);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
    this.search();
  }

  addCard(card: CardDto, position: 'MAIN' | 'SIDEBOARD' | 'MAYBEBOARD'): void {
    this.cardAdded.emit({ card, position });
    clearTimeout(this.lastAddedTimeout);
    this.lastAdded.set({ cardId: card.id, position });
    this.lastAddedTimeout = setTimeout(() => this.lastAdded.set(null), 700);
  }

  isJustAdded(cardId: number, position: 'MAIN' | 'SIDEBOARD' | 'MAYBEBOARD'): boolean {
    const s = this.lastAdded();
    return s?.cardId === cardId && s?.position === position;
  }

  // ── Resize (pointer events — мышь + тач) ─────────────────────────────────

  onResizeStart(event: PointerEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.resizeDragging = true;
    this.resizeDragStartY = event.clientY;
    this.resizeDragStartHeight = this.panelHeight();
  }

  onResizeMove(event: PointerEvent): void {
    if (!this.resizeDragging) return;
    const maxHeight = window.innerHeight * 0.9;
    const newHeight = Math.max(
      150,
      Math.min(maxHeight, this.resizeDragStartHeight + this.resizeDragStartY - event.clientY),
    );
    this.panelHeight.set(Math.round(newHeight));
  }

  onResizeEnd(): void {
    this.resizeDragging = false;
  }
}
