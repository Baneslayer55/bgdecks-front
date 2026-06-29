import { Component, OnDestroy, OnInit, ViewChild, computed, inject } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../features/auth/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink, MenuModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('decksMenu') decksMenu!: Menu;

  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private routerSub!: Subscription;

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

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.decksMenu?.hide());
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
