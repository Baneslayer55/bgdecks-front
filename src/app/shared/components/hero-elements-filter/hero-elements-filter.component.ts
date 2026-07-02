import { Component, model } from '@angular/core';
import { ImageFilterComponent, ImageFilterOption } from '../image-filter/image-filter.component';

@Component({
  selector: 'app-hero-elements-filter',
  imports: [ImageFilterComponent],
  template: `
    <app-image-filter [options]="ELEMENTS" imageDir="/img/elements" [gridCols]="3"
                      [(selected)]="selected" />
  `,
})
export class HeroElementsFilterComponent {
  readonly ELEMENTS: ImageFilterOption[] = [
    { file: 'steppe.png',    value: 'Степи',       label: 'Степи'       },
    { file: 'mountains.png', value: 'Горы',        label: 'Горы'        },
    { file: 'forest.png',    value: 'Леса',        label: 'Леса'        },
    { file: 'swamp.png',     value: 'Болота',      label: 'Болота'      },
    { file: 'dark.png',      value: 'Тьма',        label: 'Тьма'        },
    { file: 'neutral.png',   value: 'Нейтральная', label: 'Нейтральная' },
  ];

  readonly selected = model<string[]>([]);
}
