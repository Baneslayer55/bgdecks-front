import { Component, input, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { Operator, RangeFilter } from '../../models/card-search.model';

const OPERATORS: { label: string; value: Operator }[] = [
  { label: '>', value: 'GT' },
  { label: '<', value: 'LS' },
  { label: '=', value: 'EQ' },
  { label: '>=', value: 'GQ' },
  { label: '<=', value: 'LQ' },
];

@Component({
  selector: 'app-range-filter',
  imports: [FormsModule, SelectModule, InputNumberModule],
  templateUrl: './range-filter.component.html',
})
export class RangeFilterComponent implements OnInit {
  readonly label = input.required<string>();
  readonly iconSrc = input<string>();
  readonly value = model<RangeFilter | null>(null);

  readonly operators = OPERATORS;

  operatorModel: Operator | null = 'EQ';
  numberModel: number | null = null;

  ngOnInit(): void {
    const v = this.value();
    if (v) {
      this.operatorModel = v.operator;
      this.numberModel = v.value;
    }
  }

  onChanged(): void {
    if (this.operatorModel !== null && this.numberModel !== null) {
      this.value.set({ operator: this.operatorModel, value: this.numberModel });
    } else {
      this.value.set(null);
    }
  }
}
