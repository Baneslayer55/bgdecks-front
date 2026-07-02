import { Component, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../features/auth/services/auth/auth.service';
import { UserService } from '../../../features/users/services/user.service';
import { UserProfileCompactComponent } from '../user-profile-compact/user-profile-compact.component';
import { UserProfileDto } from '../../../features/decks/models/deck.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink, MenuModule, DrawerModule, UserProfileCompactComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('decksMenu') decksMenu!: Menu;
  @ViewChild('tradeMenu') tradeMenu!: Menu;

  protected readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private routerSub!: Subscription;

  readonly currentProfile = signal<UserProfileDto | null>(null);

  readonly mobileDrawerOpen = signal(false);

  readonly decksMenuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      {
        label: 'Пользователей',
        icon: 'pi pi-th-large',
        command: () => this.router.navigate(['/decks/public']),
      },
    ];
    if (this.authService.isAuthenticated()) {
      items.push({
        label: 'Мои',
        icon: 'pi pi-folder',
        command: () => this.router.navigate(['/decks/my']),
      });
    }
    return items;
  });

  readonly tradeMenuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      {
        label: 'Альбомы пользователей',
        icon: 'pi pi-images',
        command: () => this.router.navigate(['/albums/public']),
      },
    ];
    if (this.authService.isAuthenticated()) {
      items.push({
        label: 'Мои альбомы',
        icon: 'pi pi-folder',
        command: () => this.router.navigate(['/albums/my']),
      });
    }
    return items;
  });

  navigate(path: string[]): void {
    this.router.navigate(path);
    this.mobileDrawerOpen.set(false);
  }

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.decksMenu?.hide();
        this.tradeMenu?.hide();
        this.mobileDrawerOpen.set(false);
      });

    if (this.authService.isAuthenticated()) {
      this.userService.getMe().subscribe({
        next: (p) => this.currentProfile.set({
          id: p.id,
          userId: p.userId,
          username: p.username,
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          city: p.city ?? undefined,
          avatarId: p.avatarId ?? undefined,
          userSocials: p.userSocials ?? [],
        }),
      });
    }
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}
