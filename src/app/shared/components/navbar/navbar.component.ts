import { Component, computed, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../features/auth/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink, MenubarModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('menubar') menubar!: Menubar;

  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private routerSub!: Subscription;

  readonly navItems = computed<MenuItem[]>(() => {
    const decksItems: MenuItem[] = [
      {
        label: 'Пользователей',
        icon: 'pi pi-th-large',
        command: () => this.router.navigate(['/decks/public']),
      },
    ];

    if (this.authService.isAuthenticated()) {
      decksItems.push({
        label: 'Мои',
        icon: 'pi pi-folder',
        command: () => this.router.navigate(['/decks/my']),
      });
    }

    return [
      { label: 'Колоды', icon: 'pi pi-clone', items: decksItems },
      {
        label: 'База карт',
        icon: 'pi pi-images',
        command: () => this.router.navigate(['/cards']),
      },
    ];
  });

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.menubar?.hide());
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
