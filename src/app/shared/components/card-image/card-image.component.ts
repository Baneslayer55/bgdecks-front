import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CardDto } from '../../models/card.model';
import { CardImageService } from '../../services/card-image.service';
import { AuthService } from '../../../features/auth/services/auth/auth.service';
import { CardEditDialogComponent } from '../card-edit-dialog/card-edit-dialog.component';
import { CardRenameDialogComponent } from '../card-rename-dialog/card-rename-dialog.component';

@Component({
  selector: 'app-card-image',
  imports: [DialogModule, CardEditDialogComponent, CardRenameDialogComponent],
  template: `
    <img
      [src]="url()"
      [alt]="card()?.name ?? ''"
      class="w-full h-auto"
      [style]="'border-radius: 8%' + (zoomable() ? '; cursor: zoom-in' : '')"
      loading="lazy"
      draggable="false"
      (error)="onError($event)"
    />

    @if (card()?.isFoil) {
      <div
        class="absolute inset-0 pointer-events-none"
        style="
          background: linear-gradient(135deg,
            rgba(255,215,0,0.35) 0%,
            rgba(255,235,60,0.38) 20%,
            rgba(120,255,120,0.25) 40%,
            rgba(60,200,255,0.27) 65%,
            rgba(255,200,0,0.35) 85%,
            rgba(255,215,0,0.35) 100%
          );
          mix-blend-mode: screen;
          border-radius: 8%
        "
      ></div>
    }

    @if (showBan()) {
      <div
        class="absolute top-8 right-1 rounded px-1.5 py-1 text-xs leading-tight"
        style="background: rgba(185,28,28,0.92); color: #fff; max-width: 90%"
      >
        <div class="font-semibold mb-0.5">Забанена в:</div>
        @for (fmt of card()!.params!.bannedIn!; track fmt) {
          <div>{{ fmt }}</div>
        }
      </div>
    }

    @if (zoomable()) {
      <p-dialog
        [visible]="dialogVisible()"
        (visibleChange)="dialogVisible.set($event)"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [showHeader]="false"
        [dismissableMask]="true"
        appendTo="body"
        [contentStyle]="{ padding: '0', background: 'transparent', overflow: 'visible' }"
        styleClass="!shadow-none !bg-transparent overflow-visible"
      >
        <div
          class="flex flex-wrap overflow-hidden rounded-2xl"
          style="max-width: min(90vw, 660px); border: 1px solid var(--p-surface-700); background: var(--p-surface-800)"
        >
          <!-- Card image -->
          <div class="w-full sm:w-auto flex justify-center shrink-0">
            <img
              [src]="url()"
              [alt]="card()?.name ?? ''"
              style="display: block; width: 300px; max-width: 100%; height: auto; object-fit: cover; object-position: top; border-radius: 8%"
            />
          </div>

          <!-- Card info -->
          @if (card()) {
            <div class="flex flex-col gap-3 flex-1 min-w-[200px] p-4">

              <!-- Name + cost + elements -->
              <div class="flex items-start gap-2">
                @if (hasStat(card()!.params?.cost)) {
                  <div class="relative flex items-center justify-center shrink-0" style="width: 24px; height: 24px">
                    <img src="/img/texthelpers/coin.png" style="width: 24px; height: 24px; object-fit: contain" />
                    <span
                      class="absolute font-bold"
                      style="font-size: 1.15rem; color: #fff; -webkit-text-stroke: 3px #000; paint-order: stroke fill; line-height: 1"
                    >{{ card()!.params!.cost }}</span>
                  </div>
                }
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1 flex-wrap">
                    <span class="text-base font-bold leading-tight" style="color: var(--p-surface-0)">{{ card()!.name }}</span>
                    @if (card()!.params?.elements?.length) {
                      @for (el of card()!.params!.elements!; track el) {
                        <img
                          [src]="elementIcon(el)"
                          [title]="el"
                          style="width: 24px; height: 24px; object-fit: contain; flex-shrink: 0"
                        />
                      }
                    }
                  </div>
                  @if (card()!.params?.type) {
                    <div class="text-xs mt-0.5" style="color: var(--p-surface-400)">{{ card()!.params!.type }}</div>
                  }
                </div>
                @if (canEditCards()) {
                  <div class="flex gap-1 shrink-0">
                    <button
                      type="button"
                      class="w-6 h-6 flex items-center justify-center rounded"
                      style="color: var(--p-surface-400)"
                      title="Редактировать карту"
                      (click)="showEditDialog.set(true)"
                    ><i class="pi pi-pencil" style="font-size: 11px"></i></button>
                    <button
                      type="button"
                      class="w-6 h-6 flex items-center justify-center rounded"
                      style="color: var(--p-surface-400)"
                      title="Переименовать карту"
                      (click)="showRenameDialog.set(true)"
                    ><i class="pi pi-file-edit" style="font-size: 11px"></i></button>
                  </div>
                }
              </div>

              <!-- Stats: attack / health -->
              @if (hasStat(card()!.params?.attack) || hasStat(card()!.params?.health)) {
                <div class="flex gap-3">
                  @if (hasStat(card()!.params?.attack)) {
                    <div class="flex items-center gap-1">
                      <img src="/img/texthelpers/attack.png" style="width: 18px; height: 18px; object-fit: contain" />
                      <span class="text-sm font-semibold" style="color: var(--p-surface-0)">{{ card()!.params!.attack }}</span>
                    </div>
                  }
                  @if (hasStat(card()!.params?.health)) {
                    <div class="flex items-center gap-1">
                      <img src="/img/texthelpers/health.png" style="width: 18px; height: 18px; object-fit: contain" />
                      <span class="text-sm font-semibold" style="color: var(--p-surface-0)">{{ card()!.params!.health }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Classes -->
              @if (card()!.params?.classes?.length) {
                <div class="flex flex-wrap gap-1">
                  @for (cls of card()!.params!.classes!; track cls) {
                    <span class="text-xs px-2 py-0.5 rounded-full" style="background: var(--p-surface-700); color: var(--p-surface-200)">{{ cls }}</span>
                  }
                </div>
              }

              <!-- Card text -->
              @if (card()!.params?.text) {
                <p class="text-sm leading-relaxed flex-1" style="color: var(--p-surface-200); white-space: pre-line">{{ card()!.params!.text }}</p>
              }

              <!-- Meta -->
              <div class="flex flex-col gap-1 pt-2 border-t text-xs" style="border-color: var(--p-surface-700); color: var(--p-surface-400)">
                @if (card()!.rarity) {
                  <span>Редкость: <span style="color: var(--p-surface-300)">{{ card()!.rarity }}</span></span>
                }
                @if (card()!.setInfo) {
                  <span>Сет: <span style="color: var(--p-surface-300)">{{ card()!.setInfo.name }}</span></span>
                }
                @if (card()!.artist) {
                  <span>Художник: <span style="color: var(--p-surface-300)">{{ card()!.artist!.nickname || (card()!.artist!.firstName + ' ' + card()!.artist!.lastName) }}</span></span>
                }
                @if (card()!.isFoil) {
                  <span style="color: #fbbf24">✦ Фойл</span>
                }
              </div>

              <!-- Ban -->
              @if (card()!.params?.bannedIn?.length) {
                <div class="rounded-lg px-3 py-2 text-xs" style="background: rgba(185,28,28,0.15); border: 1px solid rgba(185,28,28,0.4)">
                  <div class="font-semibold mb-1" style="color: #fca5a5">Забанена в:</div>
                  <div class="flex flex-wrap gap-1">
                    @for (fmt of card()!.params!.bannedIn!; track fmt) {
                      <span class="px-1.5 py-0.5 rounded" style="background: rgba(185,28,28,0.3); color: #fca5a5">{{ fmt }}</span>
                    }
                  </div>
                </div>
              }

            </div>
          }
        </div>
      </p-dialog>

      @if (canEditCards() && card()) {
        <app-card-edit-dialog
          [card]="card()!"
          [visible]="showEditDialog()"
          (visibleChange)="showEditDialog.set($event)"
          (updated)="onCardUpdated($event)"
        />
        <app-card-rename-dialog
          [card]="card()!"
          [visible]="showRenameDialog()"
          (visibleChange)="showRenameDialog.set($event)"
          (renamed)="onCardRenamed($event)"
        />
      }
    }
  `,
  host: {
    class: 'block relative overflow-hidden',
    '(click)': 'onImageClick($event)',
  },
})
export class CardImageComponent {
  private readonly cardImageService = inject(CardImageService);
  private readonly authService = inject(AuthService);

  readonly card = input<CardDto | null>(null);
  readonly deckFormat = input<string | null>(null);
  readonly zoomable = input(true);
  readonly imageError = output<void>();
  readonly cardUpdated = output<CardDto>();

  readonly dialogVisible = signal(false);
  readonly showEditDialog = signal(false);
  readonly showRenameDialog = signal(false);

  readonly canEditCards = computed(() => this.authService.isAuthenticated() && this.authService.hasRole('edit_cards'));

  readonly url = computed(() => this.cardImageService.getCardImageUrl(this.card()));

  readonly showBan = computed(() => {
    const bannedIn = this.card()?.params?.bannedIn;
    if (!bannedIn?.length) return false;
    const fmt = this.deckFormat();
    return fmt === null ? true : bannedIn.includes(fmt);
  });

  private readonly ELEMENT_ICONS: Record<string, string> = {
    'Степи': '/img/elements/steppe.png',
    'Горы': '/img/elements/mountains.png',
    'Леса': '/img/elements/forest.png',
    'Болота': '/img/elements/swamp.png',
    'Тьма': '/img/elements/dark.png',
    'Нейтральная': '/img/elements/neutral.png',
  };

  elementIcon(el: string): string {
    return this.ELEMENT_ICONS[el] ?? '/img/elements/neutral.png';
  }

  hasStat(val: number | null | undefined): val is number {
    return val !== null && val !== undefined;
  }

  onImageClick(event: MouseEvent): void {
    if (!this.zoomable()) return;
    event.stopPropagation();
    this.dialogVisible.set(true);
  }

  onCardUpdated(card: CardDto): void {
    this.cardUpdated.emit(card);
  }

  onCardRenamed(newName: string): void {
    const c = this.card();
    if (c) this.cardUpdated.emit({ ...c, name: newName });
  }

  onError(event: Event): void {
    (event.target as HTMLElement).style.display = 'none';
    this.imageError.emit();
  }
}
