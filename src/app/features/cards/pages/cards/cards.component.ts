import { AfterViewInit, Component, computed, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardSearchService } from '../../services/card-search.service';
import { ImageFilterComponent } from '../../../../shared/components/image-filter/image-filter.component';
import { RangeFilterComponent } from '../../components/range-filter/range-filter.component';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { CardItemComponent } from '../../components/card-item/card-item.component';
import { ArtistDto, SetInfoDto } from '../../../../shared/models/card.model';
import {
  Card,
  CardClass,
  CardSearchRequest,
  FoilCriteria,
  ImageFilterOption,
  MultiElementCriteria,
  PfCriteria,
  RangeFilter,
  SelectOption,
  TextHelper,
} from '../../models/card-search.model';

const CARD_MIN_WIDTH = 200;
const CARD_GAP = 12;
const ROWS_LARGE = 3;
const ROWS_SMALL = 6;

@Component({
  selector: 'app-cards',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    PaginatorModule,
    ProgressSpinnerModule,
    ImageFilterComponent,
    RangeFilterComponent,
    TextInputComponent,
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

  // ── Static config ────────────────────────────────────────────────────────────

  readonly RARITIES: ImageFilterOption[] = [
    { file: 'common.png',    value: 'Частая',      label: 'Частая'      },
    { file: 'uncommon.png',  value: 'Необычная',   label: 'Необычная'   },
    { file: 'rare.png',      value: 'Редкая',      label: 'Редкая'      },
    { file: 'ultrarare.png', value: 'Ультраредкая', label: 'Ультраредкая' },
  ];

  readonly ELEMENTS: ImageFilterOption[] = [
    { file: 'dark.png',      value: 'Тьма',        label: 'Тьма'        },
    { file: 'forest.png',    value: 'Леса',        label: 'Леса'        },
    { file: 'mountains.png', value: 'Горы',        label: 'Горы'        },
    { file: 'neutral.png',   value: 'Нейтральная', label: 'Нейтральная' },
    { file: 'steppe.png',    value: 'Степи',       label: 'Степи'       },
    { file: 'swamp.png',     value: 'Болота',      label: 'Болота'      },
  ];

  readonly TYPES: ImageFilterOption[] = [
    { file: 'amulet.png',   value: 'Амулет',     label: 'Амулет'     },
    { file: 'armor.png',    value: 'Броня',      label: 'Броня'      },
    { file: 'creature.png', value: 'Существо',   label: 'Существо'   },
    { file: 'event.png',    value: 'Событие',    label: 'Событие'    },
    { file: 'hero.png',     value: 'Герой',      label: 'Герой'      },
    { file: 'place.png',    value: 'Местность',  label: 'Местность'  },
    { file: 'quest.png',    value: 'Квест',      label: 'Квест'      },
    { file: 'spell.png',    value: 'Заклинание', label: 'Заклинание' },
    { file: 'weapon.png',   value: 'Оружие',     label: 'Оружие'     },
  ];

  readonly TEXT_HELPERS: TextHelper[] = [
    { file: 'coin.png',        token: '{COIN}'   },
    { file: 'tap.png',         token: '{TAP}'    },
    { file: 'egg.png',         token: '{EGG}'    },
    { file: 'pray.png',        token: '{PRAY}'   },
    { file: 'quest-token.png', token: '{QUEST}'  },
    { file: 'health.png',      token: '{HEALTH}' },
    { file: 'attack.png',      token: '{ATTACK}' },
  ];

  readonly FOIL_OPTIONS: SelectOption<FoilCriteria>[] = [
    { label: 'Включая фойл',   value: 'ALL'       },
    { label: 'Только фойл',    value: 'ONLY_FOIL' },
    { label: 'Только не фойл', value: 'NON_FOIL'  },
  ];

  readonly PF_OPTIONS: SelectOption<PfCriteria>[] = [
    { label: 'Включая пф',   value: 'ALL'     },
    { label: 'Только пф',    value: 'ONLY_PF' },
    { label: 'Только не пф', value: 'NON_PF'  },
  ];

  readonly MULTI_ELEMENT_OPTIONS: SelectOption<MultiElementCriteria>[] = [
    { label: 'Включая мультистихийные',   value: 'ALL'            },
    { label: 'Исключая мультистихийные',  value: 'SINGLE_ELEMENT' },
    { label: 'Только мультистихийные',    value: 'MULTI_ELEMENT'  },
    { label: 'Только выбранные элементы', value: 'EXACT_ELEMENTS' },
  ];

  // ── Data signals ─────────────────────────────────────────────────────────────

  readonly sets          = signal<SetInfoDto[]>([]);
  readonly classes       = signal<CardClass[]>([]);
  readonly artists       = signal<ArtistDto[]>([]);
  readonly cards         = signal<Card[]>([]);
  readonly totalElements = signal(0);
  readonly loading       = signal(false);
  readonly page          = signal(0);
  readonly columns       = signal(1);
  readonly cardMinWidth  = signal(200);
  readonly rows          = signal(ROWS_LARGE);
  readonly pageSize      = computed(() => this.columns() * this.rows());
  readonly filtersOpen   = signal(true);
  readonly isMobile      = signal(window.innerWidth < 800);

  @HostListener('window:resize')
  onWindowResize(): void {
    this.isMobile.set(window.innerWidth < 800);
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  // ── Filter models ─────────────────────────────────────────────────────────────

  nameModel = '';
  textModel = '';
  selectedSets: SetInfoDto[]    = [];
  selectedClasses: CardClass[]  = [];
  selectedArtists: ArtistDto[]  = [];
  selectedRarities: string[]    = [];
  selectedElements: string[]    = [];
  selectedTypes: string[]       = [];
  foilModel: FoilCriteria                  = 'ALL';
  pfModel: PfCriteria                      = 'ALL';
  multiElementModel: MultiElementCriteria  = 'ALL';
  isStandard         = false;
  latestVersionsOnly = false;
  noAbilities        = false;
  costFilter:   RangeFilter | null = null;
  attackFilter: RangeFilter | null = null;
  healthFilter: RangeFilter | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.cardSearchService.getSets().subscribe((s) => this.sets.set(s));
    this.cardSearchService.getClasses().subscribe((c) => this.classes.set(c));
    this.cardSearchService.getArtists().subscribe((a) => this.artists.set(a));

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
      const cols = Math.max(1, Math.floor((width + CARD_GAP) / (CARD_MIN_WIDTH + CARD_GAP)));
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

  // ── Search ────────────────────────────────────────────────────────────────────

  onFilterChange(): void {
    this.searchTrigger$.next();
  }

  search(): void {
    this.loading.set(true);
    this.cardSearchService
      .search(this.buildRequest(), this.page(), this.pageSize())
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

  reset(): void {
    this.nameModel         = '';
    this.textModel         = '';
    this.selectedSets      = [];
    this.selectedClasses   = [];
    this.selectedArtists   = [];
    this.selectedRarities  = [];
    this.selectedElements  = [];
    this.selectedTypes     = [];
    this.foilModel         = 'ALL';
    this.pfModel           = 'ALL';
    this.multiElementModel = 'ALL';
    this.isStandard        = false;
    this.latestVersionsOnly = false;
    this.noAbilities       = false;
    this.costFilter        = null;
    this.attackFilter      = null;
    this.healthFilter      = null;
    this.page.set(0);
    this.search();
  }

  private buildRequest(): CardSearchRequest {
    return {
      ...(this.nameModel.trim()            && { name: this.nameModel.trim() }),
      ...(this.textModel.trim()            && { text: this.textModel.trim() }),
      ...(this.selectedSets.length         && { setIds: this.selectedSets.map((s) => s.id) }),
      ...(this.selectedClasses.length      && { classes: this.selectedClasses.map((c) => c.id) }),
      ...(this.selectedArtists.length      && { artisIds: this.selectedArtists.map((a) => a.id) }),
      ...(this.selectedRarities.length     && { rarities: this.selectedRarities }),
      ...(this.selectedElements.length     && { elements: this.selectedElements }),
      ...(this.selectedTypes.length        && { types: this.selectedTypes }),
      ...(this.foilModel !== 'ALL'         && { foilCriteria: this.foilModel }),
      ...(this.pfModel !== 'ALL'           && { pfCriteria: this.pfModel }),
      ...(this.multiElementModel !== 'ALL' && { multiElementCriteria: this.multiElementModel }),
      ...(this.isStandard                  && { isStandard: true }),
      ...(this.latestVersionsOnly          && { latestVersionsOnly: true }),
      ...(this.noAbilities                 && { noAbilities: true }),
      ...(this.costFilter                  && { costFilter: this.costFilter }),
      ...(this.attackFilter                && { attackFilter: this.attackFilter }),
      ...(this.healthFilter                && { healthFilter: this.healthFilter }),
    };
  }
}
