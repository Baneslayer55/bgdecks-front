import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KEYCLOAK_BASE_URL } from '../../../../shared/keycloak.config';
import { TokenStorageService } from '../token-storage/token-storage.service';

const PKCE_VERIFIER_KEY = 'pkce_code_verifier';
const OAUTH_STATE_KEY = 'oauth_state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = inject(KEYCLOAK_BASE_URL);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly realm = 'bgdecks';
  private readonly clientId = 'bgdecks-front';

  private get authEndpoint(): string {
    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/auth`;
  }

  private get tokenEndpoint(): string {
    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  }

  private get logoutEndpoint(): string {
    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
  }

  private get redirectUri(): string {
    return `${window.location.origin}/callback`;
  }

  async login(): Promise<void> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();

    sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const url = new URL(this.authEndpoint);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid');
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    window.location.href = url.toString();
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

    if (state !== storedState || !codeVerifier) {
      throw new Error('Invalid OAuth state or missing code verifier');
    }

    sessionStorage.removeItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code,
      code_verifier: codeVerifier,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    this.tokenStorage.storeTokens(tokens);
    await this.router.navigate(['/']);
  }

  logout(): void {
    const idToken = this.tokenStorage.getIdToken();
    this.tokenStorage.clearTokens();

    const url = new URL(this.logoutEndpoint);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('post_logout_redirect_uri', window.location.origin);
    if (idToken) {
      url.searchParams.set('id_token_hint', idToken);
    }

    window.location.href = url.toString();
  }

  forceLogout(): void {
    this.tokenStorage.clearTokens();
    this.router.navigate(['/']);
  }

  readonly isAuthenticated = computed(() => this.tokenStorage.hasToken());

  isTokenExpired(token: string, bufferSeconds = 30): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    return Date.now() / 1000 > (payload['exp'] as number) - bufferSeconds;
  }

  refreshTokens(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private refreshPromise: Promise<void> | null = null;

  private async doRefresh(): Promise<void> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      refresh_token: refreshToken,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokens = await response.json();
    this.tokenStorage.storeTokens(tokens);
  }

  getUsername(): string | null {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    return (payload?.['preferred_username'] ?? payload?.['sub'] ?? null) as string | null;
  }

  getUserId(): string | null {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return null;
    return (this.decodeToken(token)?.['sub'] ?? null) as string | null;
  }

  hasRole(role: string): boolean {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return false;
    const payload = this.decodeToken(token);
    const roles = (payload?.['realm_access'] as { roles?: unknown[] } | undefined)?.roles;
    return Array.isArray(roles) && roles.includes(role);
  }

  isCurrentUser(userId: string): boolean {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return false;
    return this.decodeToken(token)?.['sub'] === userId;
  }

  private decodeToken(token: string): Record<string, unknown> | null {
    try {
      const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = part + '='.repeat((4 - (part.length % 4)) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(96);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .slice(0, 128);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
}
