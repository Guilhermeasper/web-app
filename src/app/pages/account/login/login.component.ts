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

  signIn() {
    this.accountService.signIn().then(async () => {
      // TODO: Redirect to main page if user completed the wizard before
      this.router.navigate(['/account/wizard']);
    });
  }
}
