import { Component, output } from '@angular/core';

import { GeneralGoodsIntegrationType } from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-wizard-integration-type-chooser',
  imports: [],
  templateUrl: './integration-type-chooser.component.html',
})
export class WizardIntegrationTypeChooserComponent {
  chooseIntegrationType = output<GeneralGoodsIntegrationType>();
  GeneralGoodsIntegrationType = GeneralGoodsIntegrationType;
}
