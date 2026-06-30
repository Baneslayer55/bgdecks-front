import { Component, output } from '@angular/core';

@Component({
  selector: 'app-create-album-placeholder',
  imports: [],
  template: `
    <div
      class="flex flex-col items-center justify-center rounded-lg border transition-colors cursor-pointer w-full h-full"
      style="background: var(--p-surface-900); border-color: var(--p-surface-600); border-style: dashed"
      (click)="clicked.emit()"
    >
      <i class="pi pi-plus-circle text-3xl" style="color: var(--p-surface-400)"></i>
      <span class="text-sm font-medium mt-2" style="color: var(--p-surface-300)">Создать альбом</span>
    </div>
  `,
  host: { class: 'block h-full' },
})
export class CreateAlbumPlaceholderComponent {
  readonly clicked = output<void>();
}
