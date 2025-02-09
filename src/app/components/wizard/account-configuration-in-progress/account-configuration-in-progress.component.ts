import { Component, input } from '@angular/core';

import { GeneralGoodsIntegrationType } from '@rusbe/services/account/account.service';

import { SpinnerComponent } from '../../spinner/spinner.component';

@Component({
  selector: 'rusbe-wizard-account-configuration-in-progress',
  imports: [SpinnerComponent],
  templateUrl: './account-configuration-in-progress.component.html',
})
export class WizardAccountConfigurationInProgressComponent {
  integrationType = input.required<GeneralGoodsIntegrationType>();

  GeneralGoodsIntegrationType = GeneralGoodsIntegrationType;
}
