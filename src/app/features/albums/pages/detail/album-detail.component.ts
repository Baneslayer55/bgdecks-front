import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { CardFiltersComponent } from '../../../cards/components/card-filters/card-filters.component';
import { CardImageComponent } from '../../../../shared/components/card-image/card-image.component';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';
import { CardAutocompleteComponent } from '../../../../shared/components/card-autocomplete/card-autocomplete.component';
import {
  AlbumCardCondition,
  AlbumCardDto,
  AlbumDto,
  AlbumType,
  ALBUM_CONDITION_LABELS,
  ALBUM_TYPE_LABELS,
  isAlbumOutdated,
} from '../../models/album.model';
import { CardDto } from '../../../../shared/models/card.model';
import { CardSearchRequest } from '../../../cards/models/card-search.model';

@Component({
  selector: 'app-album-detail',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    ProgressSpinnerModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    SelectModule,
    TextareaModule,
    CardFiltersComponent,
    CardImageComponent,
    UserProfileCompactComponent,
    CardAutocompleteComponent,
  ],
  templateUrl: './album-detail.component.html',
})
export class AlbumDetailComponent implements OnInit, OnDestroy {
  private readonly albumService = inject(AlbumService);
  private readonly authService = inject(AuthService);
  private readonly searchTrigger$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  readonly albumId = input<string>();

  readonly album = signal<AlbumDto | null>(null);
  readonly albumCards = signal<AlbumCardDto[]>([]);
  readonly totalElements = signal(0);
  readonly loadingAlbum = signal(false);
  readonly loadingCards = signal(false);
  readonly loadError = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(24);
  readonly filtersOpen = signal(window.innerWidth >= 800);
  readonly isMobile = signal(window.innerWidth < 800);
  readonly cardMinWidth = computed(() => (this.isMobile() ? 110 : 140));

  readonly isOwner = computed(() => {
    const a = this.album();
    return a ? this.authService.isCurrentUser(a.owner.userId) : false;
  });

  readonly isOutdated = computed(() => isAlbumOutdated(this.album()?.updated ?? null));
  readonly upping = signal(false);

  readonly typeLabel = computed(() => {
    const a = this.album();
    return a ? ALBUM_TYPE_LABELS[a.type] : '';
  });

  // Edit mode for meta
  readonly editMeta = signal(false);
  readonly savingMeta = signal(false);

  readonly metaForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(32)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(256)],
    }),
    isPublic: new FormControl(false, { nonNullable: true }),
    type: new FormControl<AlbumType>('COLLECTION', { nonNullable: true }),
  });

  get metaNameCtrl() { return this.metaForm.controls.name; }

  // Edit mode for cards
  readonly editCards = signal(false);

  // Add card state
  readonly addCardSelected = signal<CardDto | null>(null);
  readonly addCardResetTrigger = signal(0);
  readonly addCardCount = signal(1);
  readonly addCardCondition = signal<AlbumCardCondition>('NM');
  readonly addCardPrice = signal<number | null>(null);
  readonly addingCard = signal(false);

  // Per-card edit state
  readonly editingCardId = signal<number | null>(null);
  readonly editCount = signal(1);
  readonly editCondition = signal<AlbumCardCondition>('NM');
  readonly editPrice = signal<number | null>(null);
  readonly savingCard = signal(false);
  readonly deletingCardId = signal<number | null>(null);

  private currentFilters: CardSearchRequest = {};

  readonly typeOptions = [
    { label: ALBUM_TYPE_LABELS['HAVE_LIST'], value: 'HAVE_LIST' as AlbumType },
    { label: ALBUM_TYPE_LABELS['WISH_LIST'], value: 'WISH_LIST' as AlbumType },
    { label: ALBUM_TYPE_LABELS['COLLECTION'], value: 'COLLECTION' as AlbumType },
  ];

  readonly conditionOptions = [
    { label: ALBUM_CONDITION_LABELS['NM'], value: 'NM' as AlbumCardCondition },
    { label: ALBUM_CONDITION_LABELS['SP'], value: 'SP' as AlbumCardCondition },
    { label: ALBUM_CONDITION_LABELS['HP'], value: 'HP' as AlbumCardCondition },
    { label: ALBUM_CONDITION_LABELS['DM'], value: 'DM' as AlbumCardCondition },
    { label: ALBUM_CONDITION_LABELS['LIST'], value: 'LIST' as AlbumCardCondition },
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
        this.searchCards();
      });

    const id = Number(this.albumId());
    if (id) {
      this.loadAlbum(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAlbum(id: number): void {
    this.loadingAlbum.set(true);
    this.albumService.getAlbum(id).subscribe({
      next: (album) => {
        this.album.set(album);
        this.loadingAlbum.set(false);
        this.searchCards();
      },
      error: () => {
        this.loadError.set(true);
        this.loadingAlbum.set(false);
      },
    });
  }

  onFiltersChange(req: CardSearchRequest): void {
    this.currentFilters = req;
    this.searchTrigger$.next();
  }

  searchCards(): void {
    const albumId = Number(this.albumId());
    if (!albumId) return;
    this.loadingCards.set(true);
    this.albumService
      .searchAlbumCards(albumId, this.currentFilters, this.page(), this.pageSize())
      .subscribe({
        next: (res) => {
          this.albumCards.set(res.content);
          this.totalElements.set(res.totalElements);
          this.loadingCards.set(false);
        },
        error: () => this.loadingCards.set(false),
      });
  }

  onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
    this.searchCards();
  }

  // Meta editing
  enterEditMeta(): void {
    const a = this.album();
    if (!a) return;
    this.metaForm.reset({
      name: a.name,
      description: a.description ?? '',
      isPublic: a.isPublic,
      type: a.type,
    });
    this.editMeta.set(true);
  }

  cancelEditMeta(): void {
    this.editMeta.set(false);
  }

  saveMeta(): void {
    this.metaForm.markAllAsTouched();
    if (this.metaForm.invalid) return;
    const albumId = Number(this.albumId());
    if (!albumId) return;

    this.savingMeta.set(true);
    const { name, description, isPublic, type } = this.metaForm.getRawValue();
    this.albumService.updateAlbum(albumId, { name, description, isPublic, type }).subscribe({
      next: (updated) => {
        this.album.set(updated);
        this.editMeta.set(false);
        this.savingMeta.set(false);
      },
      error: () => this.savingMeta.set(false),
    });
  }

  // Card editing toggle
  toggleEditCards(): void {
    this.editCards.update((v) => !v);
    this.cancelCardEdit();
  }

  // Add card
  onAddCardSelected(card: CardDto | null): void {
    this.addCardSelected.set(card);
  }

  addCard(): void {
    const card = this.addCardSelected();
    if (!card) return;
    const albumId = Number(this.albumId());
    if (!albumId) return;

    this.addingCard.set(true);
    this.albumService
      .addCard(albumId, {
        cardId: card.id,
        cardsCount: this.addCardCount(),
        condition: this.addCardCondition(),
        ...(this.addCardPrice() !== null && { price: this.addCardPrice()! }),
      })
      .subscribe({
        next: () => {
          this.addCardSelected.set(null);
          this.addCardResetTrigger.update((v) => v + 1);
          this.addCardCount.set(1);
          this.addCardCondition.set('NM');
          this.addCardPrice.set(null);
          this.addingCard.set(false);
          this.searchCards();
        },
        error: () => this.addingCard.set(false),
      });
  }

  // Per-card edit
  startCardEdit(albumCard: AlbumCardDto): void {
    this.editingCardId.set(albumCard.id);
    this.editCount.set(albumCard.cardsCount);
    this.editCondition.set(albumCard.condition);
    this.editPrice.set(albumCard.price);
  }

  cancelCardEdit(): void {
    this.editingCardId.set(null);
  }

  saveCard(albumCard: AlbumCardDto): void {
    const albumId = Number(this.albumId());
    if (!albumId) return;

    this.savingCard.set(true);
    this.albumService
      .updateCard(albumId, albumCard.id, {
        cardId: albumCard.card.id,
        cardsCount: this.editCount(),
        condition: this.editCondition(),
        ...(this.editPrice() !== null && { price: this.editPrice()! }),
      })
      .subscribe({
        next: () => {
          this.savingCard.set(false);
          this.editingCardId.set(null);
          this.searchCards();
        },
        error: () => this.savingCard.set(false),
      });
  }

  deleteCard(albumCard: AlbumCardDto): void {
    const albumId = Number(this.albumId());
    if (!albumId) return;

    this.deletingCardId.set(albumCard.id);
    this.albumService.deleteCard(albumId, albumCard.id).subscribe({
      next: () => {
        this.deletingCardId.set(null);
        this.searchCards();
      },
      error: () => this.deletingCardId.set(null),
    });
  }

  upAlbum(): void {
    const albumId = Number(this.albumId());
    if (!albumId) return;
    this.upping.set(true);
    this.albumService.up(albumId).subscribe({
      next: () => {
        this.upping.set(false);
        this.album.update((a) => a ? { ...a, updated: new Date().toISOString() } : a);
      },
      error: () => this.upping.set(false),
    });
  }

  conditionLabel(condition: AlbumCardCondition): string {
    return ALBUM_CONDITION_LABELS[condition];
  }
}
