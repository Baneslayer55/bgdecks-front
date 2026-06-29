import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DeckService } from '../../../features/decks/services/deck.service';
import { CardShortDto } from '../../../features/decks/models/deck.model';

@Component({
  selector: 'app-card-autocomplete',
  imports: [FormsModule, AutoCompleteModule],
  templateUrl: './card-autocomplete.component.html',
})
export class CardAutocompleteComponent {
  private readonly deckService = inject(DeckService);

  readonly searchMode = input.required<'HEROES' | 'NON_HEROES'>();
  readonly placeholder = input('Поиск...');
  readonly resetTrigger = input<number>(0);
  readonly cardSelected = output<number | null>();
  readonly cardObjectSelected = output<CardShortDto | null>();

  readonly suggestions = signal<CardShortDto[]>([]);
  selected: CardShortDto | null = null;

  constructor() {
    effect(() => {
      if (this.resetTrigger() > 0) {
        this.selected = null;
        this.suggestions.set([]);
      }
    });
  }

  search(event: { query: string }): void {
    if (!event.query.trim()) {
      this.suggestions.set([]);
      return;
    }
    this.deckService.autocomplete(event.query.trim(), this.searchMode()).subscribe({
      next: (cards) => this.suggestions.set(cards),
      error: () => this.suggestions.set([]),
    });
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    const card = event.value as CardShortDto;
    this.cardSelected.emit(card.id);
    this.cardObjectSelected.emit(card);
  }

  onClear(): void {
    this.selected = null;
    this.cardSelected.emit(null);
    this.cardObjectSelected.emit(null);
  }
}
