import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { AccountService } from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-account-login-page',
  imports: [HeaderComponent],
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
    this.accountService.signIn().then(() => {
      // TODO: Check if user needs to do wizard, if so, redirect to wizard
      this.router.navigate(['/account/details']);
    });
  }
}
