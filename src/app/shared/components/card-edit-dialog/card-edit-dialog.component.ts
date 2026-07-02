import { Component, effect, inject, input, OnInit, output, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CardDto, ArtistDto, FormatDto, SetInfoDto } from '../../models/card.model';
import { CardEditService, UpdateCardRequest } from '../../services/card-edit.service';
import { CardSearchService } from '../../../features/cards/services/card-search.service';

const ELEMENT_OPTIONS = ['Степи', 'Горы', 'Леса', 'Болота', 'Тьма', 'Нейтральная'].map((v) => ({ label: v, value: v }));

const VARIANT_OPTIONS = [
  { label: 'Обычная', value: 'regular' },
  { label: 'Полноформатная', value: 'pf' },
];

const TYPE_OPTIONS = [
  'Амулет', 'Существо', 'Квест', 'Событие',
  'Местность', 'Оружие', 'Броня', 'Заклинание', 'Герой',
].map((v) => ({ label: v, value: v }));

const RARITY_OPTIONS = [
  { label: 'Частая', value: 'Частая' },
  { label: 'Необычная', value: 'Необычная' },
  { label: 'Редкая', value: 'Редкая' },
  { label: 'Ультраредкая', value: 'Ультраредкая' },
];

@Component({
  selector: 'app-card-edit-dialog',
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    SelectModule,
    MultiSelectModule,
    TextareaModule,
  ],
  templateUrl: './card-edit-dialog.component.html',
})
export class CardEditDialogComponent implements OnInit {
  private readonly cardEditService = inject(CardEditService);
  private readonly cardSearchService = inject(CardSearchService);

  readonly card = input.required<CardDto>();
  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly updated = output<CardDto>();

  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>;

  readonly saving = signal(false);
  readonly sets = signal<SetInfoDto[]>([]);
  readonly artists = signal<ArtistDto[]>([]);
  readonly formats = signal<FormatDto[]>([]);
  readonly classOptions = signal<{ label: string; value: string }[]>([]);

  readonly elementOptions = ELEMENT_OPTIONS;
  readonly variantOptions = VARIANT_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;
  readonly rarityOptions = RARITY_OPTIONS;

  number = 0;
  setId: number | null = null;
  isFoil = false;
  rarity = '';
  variant = '';
  artistId: number | null = null;
  artistNickname = '';
  type = '';
  cost: number | null = null;
  attack: number | null = null;
  health: number | null = null;
  text = '';
  elements: string[] = [];
  classes: string[] = [];
  bannedIn: string[] = [];

  constructor() {
    effect(() => {
      if (this.visible()) this.populateForm();
    });
  }

  ngOnInit(): void {
    this.cardSearchService.getSets().subscribe((s) => this.sets.set(s));
    this.cardSearchService.getArtists().subscribe((a) => this.artists.set(a));
    this.cardSearchService.getFormats().subscribe((f) => this.formats.set(f));
    this.cardSearchService.getClasses().subscribe((c) =>
      this.classOptions.set(c.map((cl) => ({ label: cl.name, value: cl.id }))),
    );
  }

  get setOptions() {
    return this.sets().map((s) => ({ label: s.name, value: s.id }));
  }

  get artistOptions() {
    return this.artists().map((a) => ({ label: a.nickname || `${a.firstName} ${a.lastName}`, value: a.id }));
  }

  get formatOptions() {
    return this.formats().map((f) => ({ label: f.name, value: f.name }));
  }

  private populateForm(): void {
    const c = this.card();
    this.number = c.number ?? 0;
    this.setId = c.setInfo?.id ?? null;
    this.isFoil = c.isFoil ?? false;
    this.rarity = c.rarity ?? '';
    this.variant = c.variant ?? '';
    this.artistId = c.artist?.id ?? null;
    this.artistNickname = c.artist?.nickname ?? '';
    this.type = c.params?.type ?? '';
    this.cost = c.params?.cost ?? null;
    this.attack = c.params?.attack ?? null;
    this.health = c.params?.health ?? null;
    this.text = c.params?.text ?? '';
    this.elements = [...(c.params?.elements ?? [])];
    this.classes = [...(c.params?.classes ?? [])];
    this.bannedIn = [...(c.params?.bannedIn ?? [])];
    if (this.imageInputRef) this.imageInputRef.nativeElement.value = '';
  }

  save(): void {
    if (!this.setId || this.saving()) return;
    this.saving.set(true);

    const request: UpdateCardRequest = {
      number: this.number,
      setId: this.setId,
      isFoil: this.isFoil,
      rarity: this.rarity || undefined,
      variant: this.variant || undefined,
      artistId: this.artistId,
      artistNickname: this.artistNickname || undefined,
      params: {
        type: this.type,
        cost: this.cost,
        attack: this.attack,
        health: this.health,
        text: this.text || undefined,
        elements: this.elements.length ? this.elements : undefined,
        classes: this.classes.length ? this.classes : undefined,
        bannedIn: this.bannedIn.length ? this.bannedIn : undefined,
      },
    };

    const file = this.imageInputRef?.nativeElement.files?.[0];
    this.cardEditService.updateCard(this.card().id, request, file).subscribe({
      next: (updated) => {
        this.updated.emit(updated);
        this.visibleChange.emit(false);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
