import { Component, ElementRef, ViewChild, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { DeckDto } from '../../models/deck.model';
import { DeckCanvasRendererService, ExportMode } from '../../services/deck-canvas-renderer.service';

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

@Component({
  selector: 'app-deck-export',
  imports: [ButtonModule, MenuModule, DialogModule, ProgressSpinnerModule],
  templateUrl: './deck-export.component.html',
})
export class DeckExportComponent {
  private readonly renderer = inject(DeckCanvasRendererService);

  readonly deck = input.required<DeckDto>();

  @ViewChild('menu') private readonly menu!: Menu;
  @ViewChild('fileInput') private readonly fileInput!: ElementRef<HTMLInputElement>;

  readonly bgDialogOpen = signal(false);
  readonly exporting = signal(false);
  readonly exportError = signal<string | null>(null);
  readonly hoveredBg = signal<Background | 'custom' | null>(null);

  readonly backgrounds = BACKGROUNDS;
  readonly bgLabels = BG_LABELS;

  private pendingMode: ExportMode = 'badge';

  readonly menuItems: MenuItem[] = [
    {
      label: 'Скачать картинкой',
      icon: 'pi pi-image',
      command: () => this.openBgDialog('badge'),
    },
    {
      label: 'Скачать картинкой (стопками)',
      icon: 'pi pi-clone',
      command: () => this.openBgDialog('stack'),
    },
    {
      label: 'TTS Json deck',
      icon: 'pi pi-file-export',
      command: () => this.renderer.buildTtsJson(this.deck()),
    },
  ];

  private openBgDialog(mode: ExportMode): void {
    this.pendingMode = mode;
    this.exportError.set(null);
    this.bgDialogOpen.set(true);
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
      await this.renderer.render(this.deck(), bgUrl, this.pendingMode);
    } catch {
      this.exportError.set('Не удалось создать изображение');
    } finally {
      this.exporting.set(false);
    }
  }
}
