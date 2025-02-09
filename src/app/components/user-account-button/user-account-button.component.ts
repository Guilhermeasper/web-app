import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserAvatarComponent } from '@rusbe/components/user-avatar/user-avatar.component';
import {
  AccountAuthState,
  AuthStateService,
} from '@rusbe/services/auth-state/auth-state.service';

@Component({
  selector: 'rusbe-user-account-button',
  imports: [RouterModule, UserAvatarComponent],
  templateUrl: './user-account-button.component.html',
})
export class UserAccountButtonComponent {
  private authStateService = inject(AuthStateService);

  AccountAuthState = AccountAuthState;

  loginStatus = this.authStateService.accountAuthState;
}
