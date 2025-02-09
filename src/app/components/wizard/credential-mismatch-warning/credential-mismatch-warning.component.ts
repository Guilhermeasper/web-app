import { Component, inject, output } from '@angular/core';

import { WizardStep } from '@rusbe/pages/account/wizard/wizard.component';
import { AccountService } from '@rusbe/services/account/account.service';
import { AuthStateService } from '@rusbe/services/auth-state/auth-state.service';

@Component({
  selector: 'rusbe-wizard-credential-mismatch-warning',
  imports: [],
  templateUrl: './credential-mismatch-warning.component.html',
})
export class WizardCredentialMismatchWarningComponent {
  exitWizard = output<void>();
  goToStep = output<WizardStep>();

  accountService = inject(AccountService);
  authStateService = inject(AuthStateService);

  async clearIntegrationDataAndContinue() {
    // TODO: Add a loading spinner
    await this.accountService.deleteGeneralGoodsIntegrationData();
    await this.authStateService.updateAccountAuthState();
    this.exitWizard.emit();
  }
}
