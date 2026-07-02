import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
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
import { SelectModule } from 'primeng/select';
import { AlbumService } from '../../services/album.service';
import { AlbumPreviewComponent } from '../../components/album-preview/album-preview.component';
import { CreateAlbumDialogComponent } from '../../components/create-album-dialog/create-album-dialog.component';
import { CreateAlbumPlaceholderComponent } from '../../components/create-album-placeholder/create-album-placeholder.component';
import { AlbumDto, AlbumType, ALBUM_TYPE_LABELS } from '../../models/album.model';

const ALBUM_MIN_WIDTH = 280;
const ALBUM_GAP = 24;
const ROWS_LARGE = 4;
const ROWS_SMALL = 8;

@Component({
  selector: 'app-my-albums',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    ProgressSpinnerModule,
    SelectModule,
    AlbumPreviewComponent,
    CreateAlbumDialogComponent,
    CreateAlbumPlaceholderComponent,
  ],
  templateUrl: './my-albums.component.html',
})
export class MyAlbumsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly albumService = inject(AlbumService);
  private readonly router = inject(Router);
  private readonly searchTrigger$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  @ViewChild('mainContainer') private mainContainerRef!: ElementRef<HTMLElement>;

  readonly albums = signal<AlbumDto[]>([]);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly columns = signal(1);
  readonly rows = signal(ROWS_LARGE);
  readonly pageSize = computed(() => this.columns() * this.rows());
  readonly filtersOpen = signal(window.innerWidth >= 800);
  readonly isMobile = signal(window.innerWidth < 800);
  readonly albumMinWidth = computed(() => (this.isMobile() ? 150 : 280));
  readonly createDialogVisible = signal(false);
  readonly migrating = signal(false);

  selectedType: AlbumType | null = null;

  readonly typeOptions = [
    { label: 'Все типы', value: null },
    { label: ALBUM_TYPE_LABELS['HAVE_LIST'], value: 'HAVE_LIST' as AlbumType },
    { label: ALBUM_TYPE_LABELS['WISH_LIST'], value: 'WISH_LIST' as AlbumType },
    { label: ALBUM_TYPE_LABELS['COLLECTION'], value: 'COLLECTION' as AlbumType },
  ];

  @HostListener('window:resize')
  onWindowResize(): void {
    this.isMobile.set(window.innerWidth < 800);
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  ngOnInit(): void {
    this.searchTrigger$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page.set(0);
        this.search();
      });
  }

  ngAfterViewInit(): void {
    let initialSearchDone = false;
    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const cols = Math.max(1, Math.floor((width + ALBUM_GAP) / (ALBUM_MIN_WIDTH + ALBUM_GAP)));
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

  onFilterChange(): void {
    this.searchTrigger$.next();
  }

  search(): void {
    this.loading.set(true);
    this.albumService
      .getMyAlbums(
        { ...(this.selectedType && { type: this.selectedType }) },
        this.page(),
        this.pageSize(),
      )
      .subscribe({
        next: (res) => {
          this.albums.set(res.content);
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

  onAlbumCreated(id: number): void {
    this.router.navigate(['/albums', id]);
  }

  migrateAlbums(): void {
    if (this.migrating()) return;
    this.migrating.set(true);
    this.albumService.migrate().subscribe({
      next: () => {
        this.migrating.set(false);
        this.page.set(0);
        this.search();
      },
      error: () => this.migrating.set(false),
    });
  }

  reset(): void {
    this.selectedType = null;
    this.page.set(0);
    this.search();
  }
}
