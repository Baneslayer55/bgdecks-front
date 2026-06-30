import { Component, inject, model, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AlbumService } from '../../services/album.service';
import { AlbumType, ALBUM_TYPE_LABELS } from '../../models/album.model';

@Component({
  selector: 'app-create-album-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './create-album-dialog.component.html',
})
export class CreateAlbumDialogComponent {
  private readonly albumService = inject(AlbumService);

  readonly visible = model(false);
  readonly created = output<number>();

  readonly submitting = false;

  readonly typeOptions = [
    { label: ALBUM_TYPE_LABELS['HAVE_LIST'], value: 'HAVE_LIST' as AlbumType },
    { label: ALBUM_TYPE_LABELS['WISH_LIST'], value: 'WISH_LIST' as AlbumType },
    { label: ALBUM_TYPE_LABELS['COLLECTION'], value: 'COLLECTION' as AlbumType },
  ];

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(32)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(256)],
    }),
    isPublic: new FormControl(false, { nonNullable: true }),
    type: new FormControl<AlbumType>('COLLECTION', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get nameCtrl() { return this.form.controls.name; }
  get descCtrl() { return this.form.controls.description; }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, description, isPublic, type } = this.form.getRawValue();
    this.albumService.createAlbum({ name, description, isPublic, type }).subscribe({
      next: (id) => {
        this.created.emit(id);
        this.close();
      },
    });
  }

  close(): void {
    this.visible.set(false);
    this.form.reset({ name: '', description: '', isPublic: false, type: 'COLLECTION' });
  }
}
