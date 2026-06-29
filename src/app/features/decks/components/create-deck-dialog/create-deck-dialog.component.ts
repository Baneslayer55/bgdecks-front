import { Component, inject, model, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DeckService } from '../../services/deck.service';
import { FormatSelectComponent } from '../../../../shared/components/format-select/format-select.component';

@Component({
  selector: 'app-create-deck-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    FormatSelectComponent,
  ],
  templateUrl: './create-deck-dialog.component.html',
})
export class CreateDeckDialogComponent implements OnInit {
  private readonly deckService = inject(DeckService);

  readonly visible = model(false);
  readonly created = output<number>();

  readonly submitting = false;

  private firstFormatId: number | null = null;

  readonly form = new FormGroup({
    deckName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(32)],
    }),
    isPublic: new FormControl(false, { nonNullable: true }),
    formatId: new FormControl<number | null>(null, Validators.required),
  });

  get nameCtrl() { return this.form.controls.deckName; }
  get formatCtrl() { return this.form.controls.formatId; }

  ngOnInit(): void {
    this.deckService.getFormats().subscribe((formats) => {
      if (formats.length > 0) {
        this.firstFormatId = formats[0].id;
        this.form.controls.formatId.setValue(this.firstFormatId);
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { deckName, isPublic, formatId } = this.form.getRawValue();
    this.deckService.createDeck({ deckName, isPublic, formatId: formatId! }).subscribe({
      next: (id) => {
        this.created.emit(id);
        this.close();
      },
    });
  }

  close(): void {
    this.visible.set(false);
    this.form.reset({ deckName: '', isPublic: false, formatId: this.firstFormatId });
  }
}
