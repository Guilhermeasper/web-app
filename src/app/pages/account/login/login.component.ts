import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  HeaderComponent,
  HeaderType,
} from '../../../components/header/header.component';
import { AccountService } from '../../../services/account/account.service';

@Component({
  selector: 'rusbe-account-login-page',
  imports: [HeaderComponent],
  templateUrl: './login.component.html',
})
export class AccountLoginPageComponent {
  HEADER_TYPE = HeaderType.PageNameWithBackButtonOnColoredBackground;

  private accountService = inject(AccountService);
  private router = inject(Router);

  goBack() {
    // FIXME: Implement goBack
    throw new Error('Not implemented');
  }

  signIn() {
    this.accountService.signInWithPopup().then(() => {
      this.router.navigate(['/account/details']);
    });
  }
}
