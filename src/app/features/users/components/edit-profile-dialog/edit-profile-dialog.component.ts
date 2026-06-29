import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import {
  TELEGRAM_PATTERN,
  UpdateProfileRequest,
  UserProfileModel,
  USERNAME_PATTERN,
  VK_PATTERN,
} from '../../models/user.model';

@Component({
  selector: 'app-edit-profile-dialog',
  imports: [ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule],
  templateUrl: './edit-profile-dialog.component.html',
})
export class EditProfileDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  readonly profile = input.required<UserProfileModel>();
  readonly visible = model<boolean>(false);
  readonly profileUpdated = output<UserProfileModel>();

  readonly loading = signal(false);

  readonly form = this.fb.group({
    username: ['', [Validators.pattern(USERNAME_PATTERN)]],
    firstName: ['', [Validators.maxLength(32)]],
    lastName: ['', [Validators.maxLength(32)]],
    telegram: ['', [Validators.pattern(TELEGRAM_PATTERN)]],
    vk: ['', [Validators.pattern(VK_PATTERN)]],
    city: ['', [Validators.maxLength(32)]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => this.populateForm());
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && control.touched;
  }

  getError(field: string): string {
    const errors = this.form.get(field)?.errors;
    if (!errors) return '';
    if (errors['maxlength']) return `Максимум ${errors['maxlength'].requiredLength} символов`;
    if (errors['pattern']) {
      if (field === 'telegram') return 'Формат: https://t.me/username';
      if (field === 'vk') return 'Формат: https://vk.com/id';
      return 'Некорректный формат';
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const v = this.form.value;
    const request: UpdateProfileRequest = {
      ...(v.username?.trim() && { username: v.username.trim() }),
      ...(v.firstName?.trim() && { firstName: v.firstName.trim() }),
      ...(v.lastName?.trim() && { lastName: v.lastName.trim() }),
      ...(v.telegram?.trim() && { telegram: v.telegram.trim() }),
      ...(v.vk?.trim() && { vk: v.vk.trim() }),
      ...(v.city?.trim() && { city: v.city.trim() }),
    };

    this.userService.updateProfile(this.profile().id, request).subscribe({
      next: (updated) => {
        this.loading.set(false);
        this.profileUpdated.emit(updated);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось сохранить изменения.',
        });
      },
    });
  }

  private populateForm(): void {
    const p = this.profile();
    const telegram = p.userSocials.find((s) => s.socialType === 'Telegram')?.socialUrl ?? '';
    const vk = p.userSocials.find((s) => s.socialType === 'VK')?.socialUrl ?? '';
    this.form.patchValue({
      username: p.username ?? '',
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      telegram,
      vk,
      city: p.city ?? '',
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
