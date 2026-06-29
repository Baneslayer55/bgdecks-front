import { Component, input, output } from '@angular/core';
import { DeckCardDto } from '../../models/deck.model';
import { CardImageComponent } from '../../../../shared/components/card-image/card-image.component';

@Component({
  selector: 'app-edit-card-tile',
  imports: [CardImageComponent],
  template: `
    <app-card-image [card]="entry().card" [deckFormat]="deckFormat()" class="absolute inset-0" />
    <button
      type="button"
      class="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full"
      style="background: rgba(220,38,38,0.85); color: #fff"
      (click)="removed.emit()"
    ><i class="pi pi-times" style="font-size: 9px"></i></button>
    <div
      class="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 py-1"
      style="background: rgba(0,0,0,0.65)"
    >
      <button
        type="button"
        class="w-5 h-5 flex items-center justify-center rounded text-sm font-bold leading-none"
        style="color: #fff"
        (click)="decremented.emit()"
      >−</button>
      <span class="text-xs font-bold w-4 text-center" style="color: #fff">{{ entry().cardsCount }}</span>
      <button
        type="button"
        class="w-5 h-5 flex items-center justify-center rounded text-sm font-bold leading-none"
        style="color: #fff"
        (click)="incremented.emit()"
      >+</button>
    </div>
  `,
  host: {
    class: 'block relative rounded-xl overflow-hidden cursor-grab',
    style: 'aspect-ratio: 2/3; background: var(--p-surface-700)',
  },
})
export class EditCardTileComponent {
  readonly entry = input.required<DeckCardDto>();
  readonly deckFormat = input<string | null>(null);
  readonly removed = output<void>();
  readonly incremented = output<void>();
  readonly decremented = output<void>();
}
