import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CARDS_API_BASE_URL } from '../../../shared/api.config';
import { CreateUserRequest, UpdateProfileRequest, UserProfileModel } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(CARDS_API_BASE_URL);

  register(request: CreateUserRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/registration`, request);
  }

  getProfile(id: string | number): Observable<UserProfileModel> {
    return this.http.get<UserProfileModel>(`${this.baseUrl}/users/${id}`);
  }

  updateProfile(id: string | number, request: UpdateProfileRequest): Observable<UserProfileModel> {
    return this.http.put<UserProfileModel>(`${this.baseUrl}/users/${id}`, request);
  }
}
