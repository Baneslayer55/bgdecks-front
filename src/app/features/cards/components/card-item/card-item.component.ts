import { Component, input } from '@angular/core';
import { CardDto } from '../../../../shared/models/card.model';
import { CardImageComponent } from '../../../../shared/components/card-image/card-image.component';

@Component({
  selector: 'app-card-item',
  imports: [CardImageComponent],
  templateUrl: './card-item.component.html',
  host: { class: 'block' },
})
export class CardItemComponent {
  readonly card = input.required<CardDto>();
}
