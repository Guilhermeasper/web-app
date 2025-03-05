import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'rusbe-jumbo-text-input',
  imports: [FormsModule],
  providers: [provideNgxMask()],
  templateUrl: './jumbo-text-input.component.html',
})
export class JumboTextInputComponent {
  identifier = input.required<string>();
  label = input.required<string>();
  type = input<JumboTextInputType>(JumboTextInputType.Text);
  mask = input<string>();
  value = model.required<string>();
  disabled = input<boolean>(false);
  placeholder = input<string>();

  nativeInputType = computed(() => {
    const jumboType = this.type();
    const jumboTypeToNativeType: Record<JumboTextInputType, string> = {
      [JumboTextInputType.Text]: 'text',
      [JumboTextInputType.Email]: 'email',
      [JumboTextInputType.CPF]: 'text',
    };
    return jumboTypeToNativeType[jumboType];
  });
}

export enum JumboTextInputType {
  Text = 'text',
  Email = 'email',
  CPF = 'cpf',
}
