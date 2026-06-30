import { Component, HostListener, computed, input, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DeckCardDto } from '../../models/deck.model';

const SUPPORT_TYPES = ['Амулет', 'Броня', 'Оружие', 'Местность', 'Событие'];

function classifyType(type: string | undefined): 'Существа' | 'Заклинания' | 'Поддержка' | 'Квесты' {
  if (!type) return 'Квесты';
  if (type.includes('Существо')) return 'Существа';
  if (type.includes('Заклинание')) return 'Заклинания';
  if (SUPPORT_TYPES.some((s) => type.includes(s))) return 'Поддержка';
  return 'Квесты';
}

const TYPE_LABELS = ['Существа', 'Заклинания', 'Поддержка', 'Квесты'] as const;
type TypeLabel = (typeof TYPE_LABELS)[number];

const TYPE_COLORS: Record<TypeLabel, string> = {
  Существа: '#f87171',
  Заклинания: '#60a5fa',
  Поддержка: '#4ade80',
  Квесты: '#fbbf24',
};

const CLASS_COLORS = ['#818cf8', '#34d399', '#fb923c', '#e879f9', '#38bdf8'];
const REST_COLOR = '#4b5563';

const TICK_COLOR = '#6b7280';
const GRID_COLOR = 'rgba(255,255,255,0.06)';
const LABEL_COLOR = '#fff';

const BAR_DATALABELS = {
  display: (ctx: { dataset: { data: unknown[] }; dataIndex: number }) =>
    (ctx.dataset.data[ctx.dataIndex] as number) > 0,
  color: LABEL_COLOR,
  font: { size: 10, weight: 'bold' as const },
  anchor: 'center' as const,
  align: 'center' as const,
};

const PIE_DATALABELS = {
  display: (ctx: { dataset: { data: unknown[] }; dataIndex: number }) =>
    (ctx.dataset.data[ctx.dataIndex] as number) > 0,
  color: LABEL_COLOR,
  font: { size: 11, weight: 'bold' as const },
  formatter: (value: number) => value,
};

@Component({
  selector: 'app-deck-stats-panel',
  imports: [ChartModule],
  templateUrl: './deck-stats-panel.component.html',
})
export class DeckStatsPanelComponent {
  readonly mainCards = input.required<DeckCardDto[]>();
  readonly editModeActive = input(false);

  readonly panelOpen = signal(false);
  readonly panelHeight = signal(Math.round(window.innerHeight * 0.55));
  readonly isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onWindowResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  readonly chartPlugins = [ChartDataLabels];

  readonly toggleBtnClass = computed(() =>
    this.editModeActive()
      ? 'fixed bottom-4 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg cursor-pointer'
      : 'fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg cursor-pointer',
  );

  private readonly expanded = computed(() =>
    this.mainCards().flatMap((e) => Array.from({ length: e.cardsCount }, () => e.card)),
  );

  readonly costChartData = computed(() => {
    const bucketLabels = ['0', '1', '2', '3', '4', '5', '6', '7+'];
    const counts: Record<TypeLabel, number[]> = {
      Существа: new Array(8).fill(0),
      Заклинания: new Array(8).fill(0),
      Поддержка: new Array(8).fill(0),
      Квесты: new Array(8).fill(0),
    };
    for (const card of this.expanded()) {
      const bucket = Math.min(card.params?.cost ?? 0, 7);
      counts[classifyType(card.params?.type)][bucket]++;
    }
    const usedTypes = TYPE_LABELS.filter((t) => counts[t].some((v) => v > 0));
    return {
      labels: bucketLabels,
      datasets: usedTypes.map((t) => ({
        label: t,
        data: counts[t],
        backgroundColor: TYPE_COLORS[t],
        borderRadius: 3,
        borderSkipped: false,
        stack: 'cost',
      })),
    };
  });

  readonly averageCost = computed(() => {
    const cards = this.expanded();
    if (!cards.length) return '—';
    const total = cards.reduce((s, c) => s + (c.params?.cost ?? 0), 0);
    return (total / cards.length).toFixed(1);
  });

  readonly typeChartData = computed(() => {
    const counts: Record<TypeLabel, number> = {
      Существа: 0,
      Заклинания: 0,
      Поддержка: 0,
      Квесты: 0,
    };
    for (const card of this.expanded()) {
      counts[classifyType(card.params?.type)]++;
    }
    const entries = (Object.entries(counts) as [TypeLabel, number][]).filter(([, v]) => v > 0);
    return {
      labels: entries.map(([k]) => k),
      datasets: [
        {
          data: entries.map(([, v]) => v),
          backgroundColor: entries.map(([k]) => TYPE_COLORS[k]),
          borderWidth: 0,
        },
      ],
    };
  });

  readonly classChartData = computed(() => {
    const counts: Record<string, number> = {};
    for (const card of this.expanded()) {
      for (const cls of card.params?.classes ?? []) {
        counts[cls] = (counts[cls] ?? 0) + 1;
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5);
    const restSum = sorted.slice(5).reduce((s, [, v]) => s + v, 0);

    const labels = top5.map(([k]) => k);
    const data = top5.map(([, v]) => v);
    const colors = CLASS_COLORS.slice(0, top5.length);

    if (restSum > 0) {
      labels.push('Остальное');
      data.push(restSum);
      colors.push(REST_COLOR);
    }

    return {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0 }],
    };
  });

  readonly barOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { color: TICK_COLOR, font: { size: 11 }, boxWidth: 10, padding: 8 },
      },
      datalabels: BAR_DATALABELS,
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: TICK_COLOR, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        stacked: true,
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, font: { size: 11 }, stepSize: 1 },
        border: { display: false },
        beginAtZero: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  readonly pieOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: TICK_COLOR, font: { size: 11 }, boxWidth: 10, padding: 8 },
      },
      datalabels: PIE_DATALABELS,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  readonly pieOptionsMobile = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: TICK_COLOR, font: { size: 10 }, boxWidth: 8, padding: 6 },
      },
      datalabels: PIE_DATALABELS,
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  toggle(): void {
    this.panelOpen.update((v) => !v);
  }

  private resizeDragging = false;
  private resizeDragStartY = 0;
  private resizeDragStartHeight = 0;

  onResizeStart(event: PointerEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.resizeDragging = true;
    this.resizeDragStartY = event.clientY;
    this.resizeDragStartHeight = this.panelHeight();
  }

  onResizeMove(event: PointerEvent): void {
    if (!this.resizeDragging) return;
    const maxH = window.innerHeight * 0.9;
    const newH = this.resizeDragStartHeight + this.resizeDragStartY - event.clientY;
    this.panelHeight.set(Math.round(Math.max(220, Math.min(maxH, newH))));
  }

  onResizeEnd(): void {
    this.resizeDragging = false;
  }
}
