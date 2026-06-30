import { Component, ElementRef, ViewChild, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { CardImageService } from '../../../../shared/services/card-image.service';
import { CardDto, DeckDto } from '../../models/deck.model';

const BACKGROUNDS = ['mountain', 'swamp', 'forest', 'plains', 'dark', 'neutral'] as const;
type Background = (typeof BACKGROUNDS)[number];

const BG_LABELS: Record<Background, string> = {
  mountain: 'Горы',
  swamp: 'Болото',
  forest: 'Лес',
  plains: 'Равнины',
  dark: 'Тьма',
  neutral: 'Нейтральный',
};

// Layout constants for canvas rendering
const PAD = 32;
const FALLBACK_CARD_W = 192;
const FALLBACK_CARD_H = 268;
const FIXED_COLS = 7;

@Component({
  selector: 'app-deck-export',
  imports: [ButtonModule, MenuModule, DialogModule, ProgressSpinnerModule],
  templateUrl: './deck-export.component.html',
})
export class DeckExportComponent {
  private readonly cardImageService = inject(CardImageService);

  readonly deck = input.required<DeckDto>();

  @ViewChild('menu') private readonly menu!: Menu;
  @ViewChild('fileInput') private readonly fileInput!: ElementRef<HTMLInputElement>;

  readonly bgDialogOpen = signal(false);
  readonly exporting = signal(false);
  readonly exportError = signal<string | null>(null);
  readonly hoveredBg = signal<Background | 'custom' | null>(null);

  readonly backgrounds = BACKGROUNDS;
  readonly bgLabels = BG_LABELS;

  readonly menuItems: MenuItem[] = [
    {
      label: 'Скачать картинкой',
      icon: 'pi pi-image',
      command: () => {
        this.exportError.set(null);
        this.bgDialogOpen.set(true);
      },
    },
    {
      label: 'TTS Json deck',
      icon: 'pi pi-file-export',
      command: () => this.exportTtsJson(),
    },
  ];

  private exportTtsJson(): void {
    const deck = this.deck();
    const mainCards = deck.cards.filter((c) => c.position === 'MAIN');
    const sideCards = deck.cards.filter((c) => c.position === 'SIDEBOARD');

    const baseTransform = { posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: 180, rotZ: 180, scaleX: 1, scaleY: 1, scaleZ: 1 };

    const buildDeck = (name: string, entries: { card: CardDto; cardsCount: number }[]) => {
      const customDeck: Record<string, object> = {};
      const containedObjects: object[] = [];
      const deckIds: number[] = [];

      entries.forEach((entry, i) => {
        const deckId = i + 1;
        const cardId = deckId * 100;
        const face = {
          FaceURL: this.cardImageService.getCardImageUrl(entry.card),
          BackURL: '',
          NumWidth: 1,
          NumHeight: 1,
          BackIsHidden: true,
          UniqueBack: false,
          Type: 0,
        };
        customDeck[String(deckId)] = face;

        for (let c = 0; c < entry.cardsCount; c++) {
          containedObjects.push({
            Name: 'Card',
            Nickname: entry.card.name,
            Description: '',
            Transform: { ...baseTransform },
            CardID: cardId,
            CustomDeck: { [String(deckId)]: face },
          });
          deckIds.push(cardId);
        }
      });

      return {
        Name: 'DeckCustom',
        Nickname: name,
        Description: '',
        Transform: { ...baseTransform, posY: 1 },
        ContainedObjects: containedObjects,
        DeckIDs: deckIds,
        CustomDeck: customDeck,
      };
    };

    const objectStates: object[] = [];

    const mainEntries = [
      ...(deck.hero ? [{ card: deck.hero, cardsCount: 1 }] : []),
      ...mainCards.map((e) => ({ card: e.card, cardsCount: e.cardsCount })),
    ];
    if (mainEntries.length > 0) {
      objectStates.push(buildDeck(deck.name, mainEntries));
    }
    if (sideCards.length > 0) {
      objectStates.push(buildDeck(`${deck.name} – Сайдборд`, sideCards.map((e) => ({ card: e.card, cardsCount: e.cardsCount }))));
    }

    const blob = new Blob([JSON.stringify({ ObjectStates: objectStates }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportWithBackground(bg: Background): Promise<void> {
    this.bgDialogOpen.set(false);
    await this.doExport(`/img/background/${bg}.png`);
  }

  openCustomBgPicker(): void {
    this.bgDialogOpen.set(false);
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  async onCustomBgFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    try {
      await this.doExport(objUrl);
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  }

  private async doExport(bgUrl: string): Promise<void> {
    this.exporting.set(true);
    this.exportError.set(null);
    try {
      await this.renderAndDownload(bgUrl);
    } catch {
      this.exportError.set('Не удалось создать изображение');
    } finally {
      this.exporting.set(false);
    }
  }

  // Loads an image via fetch (avoids img-cache CORS taint issue)
  private async loadImage(url: string): Promise<HTMLImageElement | null> {
    try {
      const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
      if (!res.ok) return null;
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      return await new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(objUrl); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(null); };
        img.src = objUrl;
      });
    } catch {
      return null;
    }
  }

  // Local background images don't need CORS
  private loadLocalImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private async renderAndDownload(bgUrl: string): Promise<void> {
    const deck = this.deck();
    const mainCards = deck.cards.filter((c) => c.position === 'MAIN');
    const sideCards = deck.cards.filter((c) => c.position === 'SIDEBOARD');

    // Load everything in parallel first
    const [bgImg, heroImg, ...cardImgs] = await Promise.all([
      this.loadLocalImage(bgUrl),
      deck.hero ? this.loadImage(this.cardImageService.getCardImageUrl(deck.hero)) : Promise.resolve(null),
      ...[...mainCards, ...sideCards].map((e) =>
        this.loadImage(this.cardImageService.getCardImageUrl(e.card)),
      ),
    ]);
    const mainImgs = cardImgs.slice(0, mainCards.length);
    const sideImgs = cardImgs.slice(mainCards.length);

    // Natural card dimensions — draw without scaling
    const firstCard = cardImgs.find((i) => i !== null) ?? null;
    const natW = firstCard?.naturalWidth ?? FALLBACK_CARD_W;
    const natH = firstCard?.naturalHeight ?? FALLBACK_CARD_H;

    // All sizes derived from natural card dimensions
    const gap = Math.round(natW * 0.07);           // ~7% of card width
    const leftW = natW + PAD * 2 + gap;            // hero column = same card width
    const labelH = Math.round(natH * 0.07);        // section label height
    const labelFont = Math.round(natH * 0.045);    // label font size
    const badgeR = Math.round(natW * 0.09);        // badge circle radius
    const badgeFont = Math.round(badgeR * 0.9);
    const sectionGap = Math.round(natH * 0.08);    // gap between sections

    const cols = FIXED_COLS;
    const CANVAS_W = leftW + cols * (natW + gap) - gap + PAD;

    const mainRows = mainCards.length > 0 ? Math.ceil(mainCards.length / cols) : 0;
    const sideRows = sideCards.length > 0 ? Math.ceil(sideCards.length / cols) : 0;
    const CANVAS_H = Math.max(
      natH + PAD * 2,
      PAD +
      (mainRows > 0 ? labelH + mainRows * (natH + gap) : 0) +
      (sideRows > 0 ? sectionGap + labelH + sideRows * (natH + gap) : 0) +
      PAD,
    );

    // Set canvas size once, then draw everything
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;

    // Background
    if (bgImg) {
      const scale = Math.max(CANVAS_W / bgImg.width, CANVAS_H / bgImg.height);
      const bw = bgImg.width * scale;
      const bh = bgImg.height * scale;
      ctx.drawImage(bgImg, (CANVAS_W - bw) / 2, (CANVAS_H - bh) / 2, bw, bh);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.58)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Separator
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(leftW - 1, PAD, 1, CANVAS_H - PAD * 2);

    // Hero — same size as cards
    if (heroImg) {
      this.clipRect(ctx, PAD, PAD, natW, natH, Math.round(natW * 0.12), () =>
        ctx.drawImage(heroImg, PAD, PAD, natW, natH),
      );
    } else if (deck.hero) {
      this.drawPlaceholder(ctx, PAD, PAD, natW, natH, Math.round(natW * 0.12));
    }

    // Draw a section of cards at natural resolution
    const drawSection = (
      label: string,
      entries: typeof mainCards,
      images: (HTMLImageElement | null)[],
      startY: number,
    ): number => {
      let y = startY;
      ctx.font = `bold ${labelFont}px sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.fillText(label, leftW, y + labelFont);
      y += labelH;

      let col = 0;
      for (let i = 0; i < entries.length; i++) {
        const img = images[i];
        const x = leftW + col * (natW + gap);
        if (img) {
          this.clipRect(ctx, x, y, natW, natH, Math.round(natW * 0.09), () =>
            ctx.drawImage(img, x, y, natW, natH),
          );
        } else {
          this.drawPlaceholder(ctx, x, y, natW, natH, Math.round(natW * 0.09));
        }
        if (entries[i].cardsCount > 1) {
          this.drawBadge(ctx, x + natW - badgeR, y + badgeR, String(entries[i].cardsCount), badgeR, badgeFont);
        }
        col++;
        if (col >= cols) { col = 0; y += natH + gap; }
      }
      if (col > 0) y += natH + gap;
      return y;
    };

    let rightY = PAD;
    const mainTotal = mainCards.reduce((s, e) => s + e.cardsCount, 0);
    rightY = drawSection(`Основная колода  (${mainTotal})`, mainCards, mainImgs, rightY);

    if (sideCards.length > 0) {
      rightY += sectionGap;
      const sideTotal = sideCards.reduce((s, e) => s + e.cardsCount, 0);
      drawSection(`Сайдборд  (${sideTotal})`, sideCards, sideImgs, rightY);
    }

    const link = document.createElement('a');
    link.download = `${deck.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private clipRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
    draw: () => void,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.clip();
    draw();
    ctx.restore();
  }

  private drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();
    ctx.restore();
  }

  private drawBadge(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    text: string,
    r = 15,
    fontSize = 14,
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
    ctx.restore();
  }
}
