import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DeckService } from '../../services/deck.service';
import { DeckPreviewComponent } from '../../components/deck-card/deck-preview.component';
import { CreateDeckDialogComponent } from '../../components/create-deck-dialog/create-deck-dialog.component';
import { CreateDeckPlaceholderComponent } from '../../components/create-deck-placeholder/create-deck-placeholder.component';
import { CardAutocompleteComponent } from '../../../../shared/components/card-autocomplete/card-autocomplete.component';
import { FormatSelectComponent } from '../../../../shared/components/format-select/format-select.component';
import { HeroElementsFilterComponent } from '../../../../shared/components/hero-elements-filter/hero-elements-filter.component';
import { DeckPreviewDto, DeckSearchRequest } from '../../models/deck.model';

const DECK_MIN_WIDTH = 320;
const DECK_GAP = 24;
const ROWS_LARGE = 4;
const ROWS_SMALL = 8;

@Component({
  selector: 'app-my-decks',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    ProgressSpinnerModule,
    DeckPreviewComponent,
    CreateDeckDialogComponent,
    CreateDeckPlaceholderComponent,
    CardAutocompleteComponent,
    FormatSelectComponent,
    HeroElementsFilterComponent,
  ],
  templateUrl: './my-decks.component.html',
})
export class MyDecksComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly deckService = inject(DeckService);
  private readonly router = inject(Router);
  private readonly searchTrigger$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  @ViewChild('mainContainer') private mainContainerRef!: ElementRef<HTMLElement>;

  readonly decks = signal<DeckPreviewDto[]>([]);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly columns = signal(1);
  readonly rows = signal(ROWS_LARGE);
  readonly pageSize = computed(() => this.columns() * this.rows());
  readonly filtersOpen = signal(window.innerWidth >= 800);
  readonly isMobile = signal(window.innerWidth < 800);
  readonly resetTrigger = signal(0);
  readonly createDialogVisible = signal(false);

  heroId: number | null = null;
  deckCardId: number | null = null;
  formatId: number | null = null;
  heroElements: string[] = [];

  @HostListener('window:resize')
  onWindowResize(): void {
    this.isMobile.set(window.innerWidth < 800);
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  ngOnInit(): void {
    this.searchTrigger$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page.set(0);
        this.search();
      });
  }

  ngAfterViewInit(): void {
    let initialSearchDone = false;
    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const cols = Math.max(1, Math.floor((width + DECK_GAP) / (DECK_MIN_WIDTH + DECK_GAP)));
      const rows = window.innerWidth < 800 ? ROWS_SMALL : ROWS_LARGE;
      const changed = cols !== this.columns() || rows !== this.rows();
      if (changed) {
        this.columns.set(cols);
        this.rows.set(rows);
        this.page.set(0);
      }
      if (changed || !initialSearchDone) {
        initialSearchDone = true;
        this.search();
      }
    });
    this.resizeObserver.observe(this.mainContainerRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onHeroSelected(id: number | null): void {
    this.heroId = id;
    this.onFilterChange();
  }

  onDeckCardSelected(id: number | null): void {
    this.deckCardId = id;
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.searchTrigger$.next();
  }

  search(): void {
    this.loading.set(true);
    this.deckService
      .getMyDecks(this.buildRequest(), this.page(), this.pageSize())
      .subscribe({
        next: (res) => {
          this.decks.set(res.content);
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

  onDeckCreated(id: number): void {
    this.router.navigate(['/decks', id]);
  }

  reset(): void {
    this.heroId = null;
    this.deckCardId = null;
    this.formatId = null;
    this.heroElements = [];
    this.resetTrigger.update((v) => v + 1);
    this.page.set(0);
    this.search();
  }

  private buildRequest(): DeckSearchRequest {
    return {
      ...(this.heroId !== null && { heroId: this.heroId }),
      ...(this.deckCardId !== null && { deckCardId: this.deckCardId }),
      ...(this.formatId !== null && { formatId: this.formatId }),
      ...(this.heroElements.length && { heroElements: this.heroElements }),
    };
  }
}
