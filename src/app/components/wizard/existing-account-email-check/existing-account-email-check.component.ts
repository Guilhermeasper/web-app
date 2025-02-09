import { Component, OnInit, inject, input, output } from '@angular/core';

import { WizardStep } from '@rusbe/pages/account/wizard/wizard.component';
import {
  AccountService,
  GeneralGoodsIntegrationType,
} from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-wizard-existing-account-email-check',
  imports: [],
  templateUrl: './existing-account-email-check.component.html',
})
export class WizardExistingAccountEmailCheckComponent implements OnInit {
  goToStep = output<WizardStep>();
  configureAccount = output<GeneralGoodsIntegrationType.ExistingAccount>();
  generalGoodsAccountEmail = input.required<string>();

  accountService = inject(AccountService);

  WizardStep = WizardStep;

  continue() {
    this.configureAccount.emit(GeneralGoodsIntegrationType.ExistingAccount);
  }

  ngOnInit() {
    if (this.generalGoodsAccountEmail() === '') {
      this.goToStep.emit(WizardStep.ExistingGeneralGoodsAccountEmailInput);
    }
  }
}
