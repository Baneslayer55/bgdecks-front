import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { CreateUserRequest, PASSWORD_PATTERN, USERNAME_PATTERN } from '../../models/user.model';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './registration.component.html',
})
export class RegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);

  readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)],
      ],
      confirmPassword: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.pattern(USERNAME_PATTERN)]],
      firstName: ['', [Validators.maxLength(32)]],
      lastName: ['', [Validators.maxLength(32)]],
      city: ['', [Validators.maxLength(32)]],
    },
    { validators: passwordMatchValidator },
  );

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    if (!control || !control.touched) return false;
    if (control.invalid) return true;
    if (field === 'confirmPassword' && this.form.hasError('passwordMismatch')) return true;
    return false;
  }

  getError(field: string): string {
    const errors = this.form.get(field)?.errors;
    if (errors) {
      if (errors['required']) return 'Обязательное поле';
      if (errors['email']) return 'Некорректный email';
      if (errors['minlength']) return `Минимум ${errors['minlength'].requiredLength} символов`;
      if (errors['maxlength']) return `Максимум ${errors['maxlength'].requiredLength} символов`;
      if (errors['pattern']) {
        if (field === 'password') return 'Пароль не должен содержать пробелы';
        return 'Некорректный формат';
      }
    }
    if (field === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return 'Пароли не совпадают';
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const v = this.form.value;
    const request: CreateUserRequest = {
      email: v.email!,
      password: v.password!,
      username: v.username!,
      ...(v.firstName?.trim() && { firstName: v.firstName.trim() }),
      ...(v.lastName?.trim() && { lastName: v.lastName.trim() }),
      ...(v.city?.trim() && { city: v.city.trim() }),
    };

    this.userService.register(request).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось зарегистрироваться. Попробуйте ещё раз.',
        });
      },
    });
  }
}
