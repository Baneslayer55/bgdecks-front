import { Component, input, model } from '@angular/core';

export interface ImageFilterOption {
  file: string;
  value: string;
  label: string;
}

@Component({
  selector: 'app-image-filter',
  templateUrl: './image-filter.component.html',
})
export class ImageFilterComponent {
  readonly options = input.required<ImageFilterOption[]>();
  readonly imageDir = input.required<string>();
  readonly gridCols = input<number>(3);
  readonly gapPx = input<number>(6);
  readonly selected = model<string[]>([]);

  toggle(value: string): void {
    const current = this.selected();
    this.selected.set(
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );
  }

  isSelected(value: string): boolean {
    return this.selected().includes(value);
  }
}
