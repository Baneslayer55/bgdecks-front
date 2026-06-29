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
    { file: 'dark.png',      value: 'Тьма',        label: 'Тьма'        },
    { file: 'forest.png',    value: 'Леса',        label: 'Леса'        },
    { file: 'mountains.png', value: 'Горы',        label: 'Горы'        },
    { file: 'neutral.png',   value: 'Нейтральная', label: 'Нейтральная' },
    { file: 'steppe.png',    value: 'Степи',       label: 'Степи'       },
    { file: 'swamp.png',     value: 'Болота',      label: 'Болота'      },
  ];

  readonly selected = model<string[]>([]);
}
