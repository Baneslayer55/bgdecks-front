import { Component, ElementRef, input, model, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextHelper } from '../../models/card-search.model';

@Component({
  selector: 'app-text-input',
  imports: [FormsModule],
  templateUrl: './text-input.component.html',
})
export class TextInputComponent {
  readonly helpers = input.required<TextHelper[]>();
  readonly imageDir = input<string>('/img/texthelpers');
  readonly value = model<string>('');

  @ViewChild('ta') taRef!: ElementRef<HTMLTextAreaElement>;

  insertToken(token: string): void {
    const ta = this.taRef.nativeElement;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const newValue = ta.value.slice(0, start) + token + ta.value.slice(end);
    this.value.set(newValue);

    // restore cursor after inserted token
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + token.length;
      ta.focus();
    });
  }
}
