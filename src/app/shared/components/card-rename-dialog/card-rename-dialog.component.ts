import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardDto } from '../../models/card.model';
import { CardEditService } from '../../services/card-edit.service';

@Component({
  selector: 'app-card-rename-dialog',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './card-rename-dialog.component.html',
})
export class CardRenameDialogComponent {
  private readonly cardEditService = inject(CardEditService);

  readonly card = input.required<CardDto>();
  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly renamed = output<string>();

  readonly saving = signal(false);
  newName = '';

  onShow(): void {
    this.newName = this.card().name;
  }

  save(): void {
    if (!this.newName.trim() || this.saving()) return;
    this.saving.set(true);
    this.cardEditService.renameCard(this.card().name, this.newName.trim()).subscribe({
      next: () => {
        this.renamed.emit(this.newName.trim());
        this.visibleChange.emit(false);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
