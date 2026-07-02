import { inject, Injectable } from '@angular/core';
import { CardImageService } from '../../../shared/services/card-image.service';
import { DeckCardDto, DeckDto } from '../models/deck.model';

export type ExportMode = 'badge' | 'stack';

const PAD = 32;
const FALLBACK_CARD_W = 192;
const FALLBACK_CARD_H = 268;
const FIXED_COLS = 7;
const STACK_OFFSET = 36;
const MAX_STACK_DEPTH = 5;

interface RenderInput {
  bgImg: HTMLImageElement | null;
  heroImg: HTMLImageElement | null;
  mainCards: DeckCardDto[];
  sideCards: DeckCardDto[];
  mainImgs: (HTMLImageElement | null)[];
  sideImgs: (HTMLImageElement | null)[];
  deck: DeckDto;
  natW: number;
  natH: number;
}

@Injectable({ providedIn: 'root' })
export class DeckCanvasRendererService {
  private readonly cardImageService = inject(CardImageService);

  async render(deck: DeckDto, bgUrl: string, mode: ExportMode): Promise<void> {
    const mainCards = deck.cards.filter((c) => c.position === 'MAIN');
    const sideCards = deck.cards.filter((c) => c.position === 'SIDEBOARD');

    const [bgImg, heroImg, ...cardImgs] = await Promise.all([
      this.loadLocalImage(bgUrl),
      deck.hero
        ? this.loadImage(this.cardImageService.getCardImageUrl(deck.hero))
        : Promise.resolve(null),
      ...[...mainCards, ...sideCards].map((e) =>
        this.loadImage(this.cardImageService.getCardImageUrl(e.card)),
      ),
    ]);
    const mainImgs = cardImgs.slice(0, mainCards.length);
    const sideImgs = cardImgs.slice(mainCards.length);
    const firstCard = cardImgs.find((i) => i !== null) ?? null;
    const natW = firstCard?.naturalWidth ?? FALLBACK_CARD_W;
    const natH = firstCard?.naturalHeight ?? FALLBACK_CARD_H;

    const input: RenderInput = { bgImg, heroImg, mainCards, sideCards, mainImgs, sideImgs, deck, natW, natH };
    const canvas = mode === 'badge' ? this.renderBadge(input) : this.renderStack(input);

    const link = document.createElement('a');
    link.download = `${deck.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  buildTtsJson(deck: DeckDto): void {
    const mainCards = deck.cards.filter((c) => c.position === 'MAIN');
    const sideCards = deck.cards.filter((c) => c.position === 'SIDEBOARD');

    const baseTransform = { posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: 180, rotZ: 180, scaleX: 1, scaleY: 1, scaleZ: 1 };

    const buildDeck = (name: string, entries: { card: DeckCardDto['card']; cardsCount: number }[]) => {
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
    if (mainEntries.length > 0) objectStates.push(buildDeck(deck.name, mainEntries));
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

  private renderBadge(p: RenderInput): HTMLCanvasElement {
    const { bgImg, heroImg, mainCards, sideCards, mainImgs, sideImgs, deck, natW, natH } = p;

    const gap = Math.round(natW * 0.07);
    const leftW = natW + PAD * 2 + gap;
    const labelH = Math.round(natH * 0.21);
    const labelFont = Math.round(natH * 0.135);
    const badgeR = Math.round(natW * 0.09);
    const badgeFont = Math.round(badgeR * 0.9);
    const sectionGap = Math.round(natH * 0.08);
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

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;

    this.drawBackground(ctx, bgImg, CANVAS_W, CANVAS_H);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(leftW - 1, PAD, 1, CANVAS_H - PAD * 2);

    const heroY = PAD + labelH;
    if (heroImg) {
      this.clipRect(ctx, PAD, heroY, natW, natH, Math.round(natW * 0.12), () =>
        ctx.drawImage(heroImg, PAD, heroY, natW, natH),
      );
    } else if (deck.hero) {
      this.drawPlaceholder(ctx, PAD, heroY, natW, natH, Math.round(natW * 0.12));
    }

    const drawSection = (
      label: string,
      entries: DeckCardDto[],
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

    return canvas;
  }

  private renderStack(p: RenderInput): HTMLCanvasElement {
    const { bgImg, heroImg, mainCards, sideCards, mainImgs, sideImgs, deck, natW, natH } = p;

    const gap = Math.round(natW * 0.07);
    const leftW = natW + PAD * 2 + gap;
    const labelH = Math.round(natH * 0.21);
    const labelFont = Math.round(natH * 0.135);
    const sectionGap = Math.round(natH * 0.08);
    const cols = FIXED_COLS;
    const cornerR = Math.round(natW * 0.09);

    const stackExtra = (MAX_STACK_DEPTH - 1) * STACK_OFFSET;
    const cellW = natW + stackExtra;
    const cellH = natH + stackExtra;

    const CANVAS_W = leftW + cols * (cellW + gap) - gap + PAD;
    const mainRows = mainCards.length > 0 ? Math.ceil(mainCards.length / cols) : 0;
    const sideRows = sideCards.length > 0 ? Math.ceil(sideCards.length / cols) : 0;
    const CANVAS_H = Math.max(
      natH + PAD * 2,
      PAD +
        (mainRows > 0 ? labelH + mainRows * (cellH + gap) : 0) +
        (sideRows > 0 ? sectionGap + labelH + sideRows * (cellH + gap) : 0) +
        PAD,
    );

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;

    this.drawBackground(ctx, bgImg, CANVAS_W, CANVAS_H);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(leftW - 1, PAD, 1, CANVAS_H - PAD * 2);

    const heroY = PAD + labelH;
    if (heroImg) {
      this.clipRect(ctx, PAD, heroY, natW, natH, Math.round(natW * 0.12), () =>
        ctx.drawImage(heroImg, PAD, heroY, natW, natH),
      );
    } else if (deck.hero) {
      this.drawPlaceholder(ctx, PAD, heroY, natW, natH, Math.round(natW * 0.12));
    }

    // Draws i copies of the card as a physical stack offset right+down.
    // Bottom (most buried) copies are drawn first and darkened.
    const drawStackedCard = (img: HTMLImageElement | null, cellX: number, cellY: number, count: number) => {
      const depth = Math.min(count, MAX_STACK_DEPTH);
      // Draw from back (i=0, no offset, darkest) to front (i=depth-1, most offset, brightest)
      for (let i = 0; i < depth; i++) {
        const ox = i * STACK_OFFSET;
        const oy = i * STACK_OFFSET;
        ctx.save();
        ctx.filter = `brightness(${(1.0 - (depth - 1 - i) * 0.22).toFixed(2)})`;
        if (img) {
          this.clipRect(ctx, cellX + ox, cellY + oy, natW, natH, cornerR, () =>
            ctx.drawImage(img, cellX + ox, cellY + oy, natW, natH),
          );
        } else {
          this.drawPlaceholder(ctx, cellX + ox, cellY + oy, natW, natH, cornerR);
        }
        ctx.restore();
      }
    };

    const drawSection = (
      label: string,
      entries: DeckCardDto[],
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
        const x = leftW + col * (cellW + gap);
        drawStackedCard(images[i], x, y, entries[i].cardsCount);
        col++;
        if (col >= cols) { col = 0; y += cellH + gap; }
      }
      if (col > 0) y += cellH + gap;
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

    return canvas;
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    bgImg: HTMLImageElement | null,
    canvasW: number,
    canvasH: number,
  ): void {
    if (bgImg) {
      const scale = Math.max(canvasW / bgImg.width, canvasH / bgImg.height);
      ctx.drawImage(bgImg, 0, 0, bgImg.width * scale, bgImg.height * scale);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.58)';
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

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

  private loadLocalImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
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
