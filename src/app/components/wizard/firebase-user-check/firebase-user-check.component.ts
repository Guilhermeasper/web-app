import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { UserAvatarComponent } from '@rusbe/components/user-avatar/user-avatar.component';
import { WizardStep } from '@rusbe/pages/account/wizard/wizard.component';
import { AccountService } from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-wizard-firebase-user-check',
  imports: [UserAvatarComponent],
  templateUrl: './firebase-user-check.component.html',
})
export class WizardFirebaseUserCheckComponent {
  goToStep = output<WizardStep>();
  requestSignIn = input<boolean>(false);

  private accountService = inject(AccountService);
  private router = inject(Router);

  currentUser = this.accountService.currentUser;

  async verifyUser() {
    if (this.requestSignIn()) {
      // TODO: Add a loading spinner
      await this.accountService.signIn({ suggestSameUser: true });
    }
  }

  continue() {
    this.goToStep.emit(WizardStep.ChooseGeneralGoodsIntegrationType);
  }

  signOut() {
    this.accountService.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}
