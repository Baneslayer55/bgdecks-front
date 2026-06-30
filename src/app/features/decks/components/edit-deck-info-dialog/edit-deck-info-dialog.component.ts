import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DeckService } from '../../services/deck.service';
import { DeckDto, DeckFormatDto } from '../../models/deck.model';

@Component({
  selector: 'app-edit-deck-info-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './edit-deck-info-dialog.component.html',
})
export class EditDeckInfoDialogComponent {
  private readonly deckService = inject(DeckService);

  readonly deck = input.required<DeckDto>();
  readonly visible = model(false);
  readonly saved = output<void>();

  readonly submitting = signal(false);
  readonly saveError = signal(false);
  readonly formats = signal<DeckFormatDto[]>([]);

  readonly form = new FormGroup({
    deckName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(32)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(4096)],
    }),
    isPublic: new FormControl(false, { nonNullable: true }),
    formatId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  get nameCtrl() { return this.form.controls.deckName; }
  get descCtrl() { return this.form.controls.description; }
  get formatCtrl() { return this.form.controls.formatId; }

  constructor() {
    this.deckService.getFormats().subscribe((f) => this.formats.set(f));

    effect(() => {
      if (this.visible()) {
        const d = this.deck();
        this.form.reset({
          deckName: d.name,
          description: d.description ?? '',
          isPublic: d.isPublic,
          formatId: d.format?.id ?? null,
        });
        this.saveError.set(false);
        this.form.markAsUntouched();
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { deckName, description, isPublic, formatId } = this.form.getRawValue();
    this.submitting.set(true);
    this.saveError.set(false);

    this.deckService.updateDeckInfo(this.deck().id, { deckName, description, isPublic, formatId: formatId! }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
        this.visible.set(false);
      },
      error: () => {
        this.submitting.set(false);
        this.saveError.set(true);
      },
    });
  }

  close(): void {
    this.visible.set(false);
  }
}
