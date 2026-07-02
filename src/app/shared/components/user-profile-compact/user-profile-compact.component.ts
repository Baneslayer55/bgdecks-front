import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../api.config';
import { SocialModel, UserProfileDto } from '../../../features/decks/models/deck.model';

@Component({
  selector: 'app-user-profile-compact',
  templateUrl: './user-profile-compact.component.html',
  imports: [RouterLink],
  host: {
    class: 'flex items-center gap-2 min-w-0',
  },
})
export class UserProfileCompactComponent {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly profile = input.required<UserProfileDto>();
  readonly showSocials = input<boolean>(false);

  readonly avatarUrl = computed(() => {
    const id = this.profile().avatarId;
    return id ? `${this.baseUrl}/profiles/avatar/${id}` : null;
  });

  readonly initials = computed(() => {
    const p = this.profile();
    const parts = [p.firstName?.[0], p.lastName?.[0]].filter((c): c is string => !!c);
    return (parts.length ? parts.join('') : (p.username?.[0] ?? '')).toUpperCase();
  });

  readonly fullName = computed(() => {
    const p = this.profile();
    return [p.firstName, p.lastName]
      .filter((s): s is string => !!s?.trim())
      .join(' ')
      .trim();
  });

  readonly telegram = computed<SocialModel | null>(
    () => this.profile().userSocials?.find((s) => s.socialType === 'Telegram') ?? null,
  );

  readonly vk = computed<SocialModel | null>(
    () => this.profile().userSocials?.find((s) => s.socialType === 'VK') ?? null,
  );
}
