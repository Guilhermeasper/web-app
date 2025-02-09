import { Component, output } from '@angular/core';

import { WizardStep } from '@rusbe/pages/account/wizard/wizard.component';

@Component({
  selector: 'rusbe-wizard-account-configuration-error',
  imports: [],
  templateUrl: './account-configuration-error.component.html',
})
export class WizardAccountConfigurationErrorComponent {
  goToStep = output<WizardStep>();

  WizardStep = WizardStep;
}
