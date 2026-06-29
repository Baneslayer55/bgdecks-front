import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { API_BASE_URL } from '../../../../shared/api.config';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfileModel } from '../../models/user.model';
import { EditProfileDialogComponent } from '../../components/edit-profile-dialog/edit-profile-dialog.component';

@Component({
  selector: 'app-profile',
  imports: [ButtonModule, ProgressSpinnerModule, EditProfileDialogComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly id = input<string>();

  readonly profile = signal<UserProfileModel | null>(null);
  readonly loading = signal(false);
  readonly hasError = signal(false);
  readonly dialogVisible = signal(false);

  readonly isOwnProfile = computed(() => {
    const p = this.profile();
    return p ? this.authService.isCurrentUser(p.userId) : false;
  });

  get avatarUrl(): string {
    const avatarId = this.profile()?.avatarId;
    return avatarId ? `${this.apiBaseUrl}/profiles/avatar/${avatarId}` : '';
  }

  get initials(): string {
    const p = this.profile();
    if (!p) return '';
    const parts = [p.firstName?.[0], p.lastName?.[0]].filter((c): c is string => !!c);
    return (parts.length ? parts.join('') : (p.username?.[0] ?? '')).toUpperCase();
  }

  get fullName(): string {
    const p = this.profile();
    if (!p) return '';
    return [p.firstName, p.lastName]
      .filter((part): part is string => !!part?.trim())
      .join(' ')
      .trim();
  }

  get telegramSocial() {
    return this.profile()?.userSocials.find((s) => s.socialType === 'Telegram') ?? null;
  }

  get vkSocial() {
    return this.profile()?.userSocials.find((s) => s.socialType === 'VK') ?? null;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const id = this.id();
    if (!id) return;
    this.loading.set(true);
    this.hasError.set(false);
    this.userService.getProfile(id).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.loading.set(false);
      },
    });
  }

  onProfileUpdated(updated: UserProfileModel): void {
    this.profile.set(updated);
    this.dialogVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Сохранено',
      detail: 'Профиль успешно обновлён.',
    });
  }
}
