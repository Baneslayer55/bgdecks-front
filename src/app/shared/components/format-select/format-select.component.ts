import { Component, computed, inject, input, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DeckService } from '../../../features/decks/services/deck.service';
import { DeckFormatDto } from '../../../features/decks/models/deck.model';

@Component({
  selector: 'app-format-select',
  imports: [FormsModule, SelectModule],
  templateUrl: './format-select.component.html',
})
export class FormatSelectComponent implements OnInit {
  private readonly deckService = inject(DeckService);

  readonly value = model<number | null>(null);
  readonly showNullOption = input(false);
  readonly placeholder = input('Формат');

  readonly formats = signal<DeckFormatDto[]>([]);

  readonly options = computed(() =>
    this.showNullOption()
      ? [{ id: null, name: 'Любой формат', description: '' }, ...this.formats()]
      : this.formats(),
  );

  onNgModelChange(val: number | null): void {
    if (val !== this.value()) {
      this.value.set(val);
    }
  }

  ngOnInit(): void {
    this.deckService.getFormats().subscribe((f) => this.formats.set(f));
  }
}
