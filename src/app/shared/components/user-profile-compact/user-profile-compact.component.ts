import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../api.config';
import { UserProfileDto } from '../../../features/decks/models/deck.model';

@Component({
  selector: 'app-user-profile-compact',
  templateUrl: './user-profile-compact.component.html',
  host: {
    class: 'flex items-center gap-2 min-w-0 cursor-pointer',
    '(click)': 'navigate($event)',
  },
})
export class UserProfileCompactComponent {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly router = inject(Router);

  readonly profile = input.required<UserProfileDto>();

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

  navigate(event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/profile', this.profile().id]);
  }
}
