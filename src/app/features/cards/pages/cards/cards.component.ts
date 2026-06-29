import { AfterViewInit, Component, computed, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardSearchService } from '../../services/card-search.service';
import { CardFiltersComponent } from '../../components/card-filters/card-filters.component';
import { CardItemComponent } from '../../components/card-item/card-item.component';
import { Card, CardSearchRequest } from '../../models/card-search.model';

const CARD_MIN_WIDTH = 200;
const CARD_GAP = 12;
const ROWS_LARGE = 3;
const ROWS_SMALL = 6;

@Component({
  selector: 'app-cards',
  imports: [
    NgTemplateOutlet,
    PaginatorModule,
    ProgressSpinnerModule,
    CardFiltersComponent,
    CardItemComponent,
  ],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css',
})
export class CardsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly cardSearchService = inject(CardSearchService);
  private readonly searchTrigger$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  @ViewChild('mainContainer') private mainContainerRef!: ElementRef<HTMLElement>;

  readonly cards         = signal<Card[]>([]);
  readonly totalElements = signal(0);
  readonly loading       = signal(false);
  readonly page          = signal(0);
  readonly columns       = signal(1);
  readonly cardMinWidth  = computed(() => (this.isMobile() ? 160 : CARD_MIN_WIDTH));
  readonly rows          = signal(ROWS_LARGE);
  readonly pageSize      = computed(() => this.columns() * this.rows());
  readonly filtersOpen   = signal(window.innerWidth >= 800);
  readonly isMobile      = signal(window.innerWidth < 800);

  private currentFilters: CardSearchRequest = {};

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
    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const cols = Math.max(1, Math.floor((width + CARD_GAP) / (this.cardMinWidth() + CARD_GAP)));
      const rows = window.innerWidth < 800 ? ROWS_SMALL : ROWS_LARGE;
      if (cols !== this.columns() || rows !== this.rows()) {
        this.columns.set(cols);
        this.rows.set(rows);
        this.page.set(0);
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

  onFiltersChange(req: CardSearchRequest): void {
    this.currentFilters = req;
    this.searchTrigger$.next();
  }

  search(): void {
    this.loading.set(true);
    this.cardSearchService
      .search(this.currentFilters, this.page(), this.pageSize())
      .subscribe({
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
}
