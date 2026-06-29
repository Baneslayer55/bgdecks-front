import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { CardSearchService } from '../../services/card-search.service';
import { ImageFilterComponent } from '../../../../shared/components/image-filter/image-filter.component';
import { RangeFilterComponent } from '../range-filter/range-filter.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { ArtistDto, SetInfoDto } from '../../../../shared/models/card.model';
import {
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

@Component({
  selector: 'app-card-filters',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    ImageFilterComponent,
    RangeFilterComponent,
    TextInputComponent,
  ],
  templateUrl: './card-filters.component.html',
})
export class CardFiltersComponent implements OnInit {
  private readonly cardSearchService = inject(CardSearchService);

  readonly filtersChange = output<CardSearchRequest>();

  readonly RARITIES: ImageFilterOption[] = [
    { file: 'common.png',    value: 'Частая',       label: 'Частая'       },
    { file: 'uncommon.png',  value: 'Необычная',    label: 'Необычная'    },
    { file: 'rare.png',      value: 'Редкая',       label: 'Редкая'       },
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

  readonly sets    = signal<SetInfoDto[]>([]);
  readonly classes = signal<CardClass[]>([]);
  readonly artists = signal<ArtistDto[]>([]);

  nameModel = '';
  textModel = '';
  selectedSets: SetInfoDto[]   = [];
  selectedClasses: CardClass[] = [];
  selectedArtists: ArtistDto[] = [];
  selectedRarities: string[]   = [];
  selectedElements: string[]   = [];
  selectedTypes: string[]      = [];
  foilModel: FoilCriteria                 = 'ALL';
  pfModel: PfCriteria                     = 'ALL';
  multiElementModel: MultiElementCriteria = 'ALL';
  isStandard         = false;
  latestVersionsOnly = false;
  noAbilities        = false;
  costFilter:   RangeFilter | null = null;
  attackFilter: RangeFilter | null = null;
  healthFilter: RangeFilter | null = null;

  ngOnInit(): void {
    this.cardSearchService.getSets().subscribe((s) => this.sets.set(s));
    this.cardSearchService.getClasses().subscribe((c) => this.classes.set(c));
    this.cardSearchService.getArtists().subscribe((a) => this.artists.set(a));
  }

  onFilterChange(): void {
    this.filtersChange.emit(this.buildRequest());
  }

  reset(): void {
    this.nameModel          = '';
    this.textModel          = '';
    this.selectedSets       = [];
    this.selectedClasses    = [];
    this.selectedArtists    = [];
    this.selectedRarities   = [];
    this.selectedElements   = [];
    this.selectedTypes      = [];
    this.foilModel          = 'ALL';
    this.pfModel            = 'ALL';
    this.multiElementModel  = 'ALL';
    this.isStandard         = false;
    this.latestVersionsOnly = false;
    this.noAbilities        = false;
    this.costFilter         = null;
    this.attackFilter       = null;
    this.healthFilter       = null;
    this.filtersChange.emit({});
  }

  buildRequest(): CardSearchRequest {
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
