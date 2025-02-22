import { Dialog } from '@angular/cdk/dialog';
import {
  Component,
  TemplateRef,
  computed,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronRight,
  lucideEye,
  lucideEyeOff,
  lucideKeyRound,
  lucideLock,
  lucideLogOut,
  lucideMail,
  lucidePlus,
  lucideSquareArrowOutUpRight,
  lucideTrash,
  lucideUserRoundPen,
} from '@ng-icons/lucide';

import {
  BalanceViewerColorScheme,
  BalanceViewerComponent,
} from '@rusbe/components/balance-viewer/balance-viewer.component';
import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { UserAvatarComponent } from '@rusbe/components/user-avatar/user-avatar.component';
import { AccountService } from '@rusbe/services/account/account.service';
import {
  AccountAuthState,
  AuthStateService,
} from '@rusbe/services/auth-state/auth-state.service';
import { DEFAULT_GENERATED_PASSWORD_LENGTH } from '@rusbe/services/crypto/crypto.service';

@Component({
  selector: 'rusbe-account-details-page',
  imports: [
    NgIcon,
    HeaderComponent,
    UserAvatarComponent,
    BalanceViewerComponent,
  ],
  templateUrl: './details.component.html',
  viewProviders: [
    provideIcons({
      lucidePlus,
      lucideMail,
      lucideKeyRound,
      lucideLogOut,
      lucideLock,
      lucideSquareArrowOutUpRight,
      lucideTrash,
      lucideChevronRight,
      lucideUserRoundPen,
      lucideEyeOff,
      lucideEye,
    }),
  ],
})
export class AccountDetailsPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButton;
  readonly BALANCE_VIEWER_COLOR_SCHEME = BalanceViewerColorScheme.Overlay;
  readonly HIDDEN_PASSWORD_STRING = '•'.repeat(
    DEFAULT_GENERATED_PASSWORD_LENGTH,
  );

  private accountService = inject(AccountService);
  private authStateService = inject(AuthStateService);
  private router = inject(Router);
  dialog = inject(Dialog);

  confirmDialogTemplate =
    viewChild.required<TemplateRef<Element>>('confirmDialog');

  currentRusbeUser = this.accountService.currentUser;
  authState = this.authStateService.accountAuthState;
  accountData = this.authStateService.generalGoodsAccountData;
  isPlainTextPasswordVisible = signal<boolean>(false);
  plainTextPassword = resource({
    request: () => ({ authState: this.authState() }),
    // `undefined` means the password is still loading, `null` means it cannot be fetched (e.g. credentials are not available).
    loader: async ({ request }) => {
      if (request.authState !== AccountAuthState.LoggedIn) {
        return undefined;
      }

      try {
        const accountCredentials =
          await this.accountService.fetchGeneralGoodsAccountCredentials();

        return accountCredentials.password;
      } catch {
        return null;
      }
    },
  });

  AccountAuthState = AccountAuthState;

  maskedCPF = computed(() => {
    const accountData = this.accountData();

    // TODO: Show a skeleton loading for the account data
    if (!accountData || accountData.cpfNumber.length !== 11) {
      return '•••.•••.•••-••';
    }

    // Mask 3 first digits and 2 last digits
    return `•••.${accountData.cpfNumber.slice(3, 6)}.${accountData.cpfNumber.slice(6, 9)}-••`;
  });

  authUserQueryParam = computed(() => {
    if (!this.currentRusbeUser()) return '';

    return `?authuser=${this.currentRusbeUser()?.email}`;
  });

  async refreshCredentials() {
    await this.accountService.signIn({ suggestSameUser: true });

    // This resource reload only happens when `signInWithPopup` is being used by Firebase Service.
    // When `signInWithRedirect` is used instead, the resource will be loaded as soon as the user
    // is redirected back to the app.
    this.plainTextPassword.reload();
  }

  togglePlainTextPasswordVisibility() {
    this.isPlainTextPasswordVisible.update((value) => !value);
  }

  signOut() {
    this.accountService.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  promptDeleteAccount() {
    this.dialog.open(this.confirmDialogTemplate(), {
      autoFocus: 'button',
      backdropClass: 'bg-beterraba/60',
    });
  }

  deleteAccount() {
    this.accountService.deleteAccount().then(() => {
      this.router.navigate(['/account/login']);
    });
  }
}
