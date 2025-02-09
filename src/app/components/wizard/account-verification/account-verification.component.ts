import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  OnInit,
  inject,
  model,
  output,
  signal,
} from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy } from '@ng-icons/lucide';

import { SpinnerComponent } from '@rusbe/components/spinner/spinner.component';
import { WizardStep } from '@rusbe/pages/account/wizard/wizard.component';
import {
  AccountService,
  GeneralGoodsAccountStub,
  GeneralGoodsIntegrationStatus,
  GeneralGoodsIntegrationType,
} from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-wizard-account-verification',
  imports: [SpinnerComponent, NgIcon],
  viewProviders: [provideIcons({ lucideCopy })],
  templateUrl: './account-verification.component.html',
})
export class WizardAccountVerificationComponent implements OnInit {
  goToStep = output<WizardStep>();
  accountStub = model.required<GeneralGoodsAccountStub | undefined>();

  WizardStep = WizardStep;
  GeneralGoodsIntegrationType = GeneralGoodsIntegrationType;

  clipboard = inject(Clipboard);
  accountService = inject(AccountService);

  integrationStatus = signal<GeneralGoodsIntegrationStatus | undefined>(
    undefined,
  );
  copiedToClipboard = signal<boolean>(false);

  ngOnInit() {
    this.initialize();
  }

  async initialize() {
    if (!this.accountStub()) {
      await this.fetchGeneralGoodsAccountStub();
    }
    await this.fetchGeneralGoodsIntegrationStatus();
  }

  async fetchGeneralGoodsAccountStub() {
    const accountStub =
      await this.accountService.fetchGeneralGoodsAccountCredentials();
    this.accountStub.set(accountStub);
  }

  async fetchGeneralGoodsIntegrationStatus() {
    const integrationData =
      await this.accountService.fetchGeneralGoodsIntegrationStatus();
    this.integrationStatus.set(integrationData);
  }

  async resendEmail() {
    const integrationStatus = this.integrationStatus();
    const accountStub = this.accountStub()!;

    if (
      integrationStatus?.integrationType ===
      GeneralGoodsIntegrationType.NewAccount
    ) {
      await this.accountService.sendNewGeneralGoodsAccountVerificationEmail(
        accountStub,
      );
    }

    if (
      integrationStatus?.integrationType ===
      GeneralGoodsIntegrationType.ExistingAccount
    ) {
      await this.accountService.sendExistingGeneralGoodsAccountPasswordResetEmail(
        accountStub,
      );
    }
  }

  async completeSetup() {
    const accountStub = this.accountStub()!;

    await this.accountService.completeGeneralGoodsAccountSetup(accountStub);
    this.goToStep.emit(WizardStep.ChooseGeneralGoodsIntegrationType);
  }

  async copyPasswordToClipboard() {
    const accountStub = this.accountStub()!;
    await this.clipboard.copy(accountStub.password);
    this.copiedToClipboard.set(true);
  }

  // TODO: Auto-verify each 30 seconds
  // TODO: Limit the number of e-mails sent
}
