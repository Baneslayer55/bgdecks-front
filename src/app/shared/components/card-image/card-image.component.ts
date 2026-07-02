import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CardDto } from '../../models/card.model';
import { CardImageService } from '../../services/card-image.service';

@Component({
  selector: 'app-card-image',
  imports: [DialogModule],
  template: `
    <img
      [src]="url()"
      [alt]="card()?.name ?? ''"
      class="w-full h-full object-cover object-top"
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
        [contentStyle]="{ padding: '0', background: 'transparent' }"
        styleClass="!shadow-none !bg-transparent overflow-hidden rounded-2xl"
      >
        <img
          [src]="url()"
          [alt]="card()?.name ?? ''"
          style="display: block; width: 300px; height: auto; border-radius: 4%"
        />
      </p-dialog>
    }
  `,
  host: {
    class: 'block relative overflow-hidden',
    '(click)': 'onImageClick($event)',
  },
})
export class CardImageComponent {
  private readonly cardImageService = inject(CardImageService);

  readonly card = input<CardDto | null>(null);
  readonly deckFormat = input<string | null>(null);
  readonly zoomable = input(true);
  readonly imageError = output<void>();

  readonly dialogVisible = signal(false);

  readonly url = computed(() => this.cardImageService.getCardImageUrl(this.card()));

  readonly showBan = computed(() => {
    const bannedIn = this.card()?.params?.bannedIn;
    if (!bannedIn?.length) return false;
    const fmt = this.deckFormat();
    return fmt === null ? true : bannedIn.includes(fmt);
  });

  onImageClick(event: MouseEvent): void {
    if (!this.zoomable()) return;
    event.stopPropagation();
    this.dialogVisible.set(true);
  }

  onError(event: Event): void {
    (event.target as HTMLElement).style.display = 'none';
    this.imageError.emit();
  }
}
