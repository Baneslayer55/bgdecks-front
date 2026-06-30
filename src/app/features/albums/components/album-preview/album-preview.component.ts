import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AlbumDto, ALBUM_TYPE_LABELS, isAlbumOutdated } from '../../models/album.model';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { UserProfileCompactComponent } from '../../../../shared/components/user-profile-compact/user-profile-compact.component';

@Component({
  selector: 'app-album-preview',
  imports: [DatePipe, ButtonModule, UserProfileCompactComponent],
  templateUrl: './album-preview.component.html',
  host: { class: 'block' },
})
export class AlbumPreviewComponent {
  private readonly router = inject(Router);
  private readonly albumService = inject(AlbumService);
  private readonly authService = inject(AuthService);

  readonly album = input.required<AlbumDto>();

  readonly typeLabel = computed(() => ALBUM_TYPE_LABELS[this.album().type]);
  readonly isOwner = computed(() => this.authService.isCurrentUser(this.album().owner.userId));
  readonly isOutdated = computed(() => isAlbumOutdated(this.album().updated));
  readonly upping = signal(false);

  navigate(): void {
    this.router.navigate(['/albums', this.album().id]);
  }

  upAlbum(event: MouseEvent): void {
    event.stopPropagation();
    this.upping.set(true);
    this.albumService.up(this.album().id).subscribe({
      next: () => this.upping.set(false),
      error: () => this.upping.set(false),
    });
  }
}
