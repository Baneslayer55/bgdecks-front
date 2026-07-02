import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AlbumDto, ALBUM_TYPE_LABELS, isAlbumOutdated } from '../../models/album.model';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';

@Component({
  selector: 'app-album-preview',
  imports: [RouterLink, DatePipe, ButtonModule, DialogModule, UserProfileCompactComponent],
  templateUrl: './album-preview.component.html',
  host: { class: 'block' },
})
export class AlbumPreviewComponent {
  private readonly albumService = inject(AlbumService);
  private readonly authService = inject(AuthService);

  readonly album = input.required<AlbumDto>();
  readonly deleted = output<void>();

  readonly typeLabel = computed(() => ALBUM_TYPE_LABELS[this.album().type]);
  readonly isOwner = computed(() => this.authService.isCurrentUser(this.album().owner.userId));
  readonly isOutdated = computed(() => isAlbumOutdated(this.album().updated));
  readonly upping = signal(false);
  readonly confirmVisible = signal(false);
  readonly deleting = signal(false);

  upAlbum(event: MouseEvent): void {
    event.stopPropagation();
    this.upping.set(true);
    this.albumService.up(this.album().id).subscribe({
      next: () => this.upping.set(false),
      error: () => this.upping.set(false),
    });
  }

  onDeleteClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmVisible.set(true);
  }

  confirmDelete(): void {
    this.deleting.set(true);
    this.albumService.deleteAlbum(this.album().id).subscribe({
      next: () => {
        this.confirmVisible.set(false);
        this.deleting.set(false);
        this.deleted.emit();
      },
      error: () => this.deleting.set(false),
    });
  }
}
