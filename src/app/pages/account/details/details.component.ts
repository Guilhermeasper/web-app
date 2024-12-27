import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { AccountService } from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-account-details-page',
  imports: [HeaderComponent],
  templateUrl: './details.component.html',
})
export class AccountDetailsPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButton;

  private accountService = inject(AccountService);
  private router = inject(Router);

  signOut() {
    this.accountService.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}
