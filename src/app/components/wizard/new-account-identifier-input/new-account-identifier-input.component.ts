import { Component, model, output } from '@angular/core';

import { WizardStep } from '@rusbe/pages/account/wizard/wizard.component';
import { GeneralGoodsIntegrationType } from '@rusbe/services/account/account.service';

import { JumboTextInputComponent } from '../../jumbo-text-input/jumbo-text-input.component';

@Component({
  selector: 'rusbe-wizard-new-account-identifier-input',
  imports: [JumboTextInputComponent],
  templateUrl: './new-account-identifier-input.component.html',
})
export class WizardNewAccountIdentifierInputComponent {
  goToStep = output<WizardStep>();
  configureAccount = output<GeneralGoodsIntegrationType.NewAccount>();

  identifier = model.required<string>();

  WizardStep = WizardStep;

  continue() {
    this.configureAccount.emit(GeneralGoodsIntegrationType.NewAccount);
  }
}
