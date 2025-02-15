import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { AccountService } from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-account-login-page',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './login.component.html',
})
export class AccountLoginPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButtonOnColoredBackground;

  private router = inject(Router);
  private location = inject(Location);
  private accountService = inject(AccountService);

  goBack() {
    if (this.router.lastSuccessfulNavigation?.previousNavigation != null) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  async signIn() {
    await this.accountService.signIn();

    // This navigation only happens when `signInWithPopup` is being used by Firebase Service.
    // When `signInWithRedirect` is used instead, the redirection to the wizard page is handled by a router guard.
    this.router.navigate(['/account/wizard']);
  }
}
