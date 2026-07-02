import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_BASE_URL } from '../../../shared/api.config';
import { CreateUserRequest, UpdateProfileRequest, UserProfileModel } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private me$?: Observable<UserProfileModel>;
  readonly me = signal<UserProfileModel | null>(null);

  register(request: CreateUserRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/registration`, request);
  }

  getMe(): Observable<UserProfileModel> {
    this.me$ ??= this.http.get<UserProfileModel>(`${this.baseUrl}/users/me`).pipe(
      tap((p) => this.me.set(p)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.me$;
  }

  getProfile(id: string | number): Observable<UserProfileModel> {
    return this.http.get<UserProfileModel>(`${this.baseUrl}/users/${id}`);
  }

  updateProfile(id: string | number, request: UpdateProfileRequest): Observable<UserProfileModel> {
    return this.http.put<UserProfileModel>(`${this.baseUrl}/users/${id}`, request).pipe(
      tap((updated) => {
        this.me.set(updated);
        this.me$ = undefined;
      }),
    );
  }
}
