import { Component, output } from '@angular/core';

@Component({
  selector: 'app-create-deck-placeholder',
  imports: [],
  template: `
    <div
      class="flex rounded-lg border transition-colors cursor-pointer w-full"
      style="background: var(--p-surface-900); border-color: var(--p-surface-600); border-style: dashed"
      (click)="clicked.emit()"
    >
      <div
        class="w-40 shrink-0 flex items-center justify-center rounded-l-lg"
        style="aspect-ratio: 2/3; background: var(--p-surface-800)"
      >
        <i class="pi pi-plus text-3xl" style="color: var(--p-surface-500)"></i>
      </div>
      <div class="flex flex-col items-center justify-center p-3 flex-1 gap-3">
        <i class="pi pi-plus-circle text-3xl" style="color: var(--p-surface-400)"></i>
        <span class="text-sm font-medium text-center" style="color: var(--p-surface-300)">Создать колоду</span>
      </div>
    </div>
  `,
  host: { class: 'block' },
})
export class CreateDeckPlaceholderComponent {
  readonly clicked = output<void>();
}
