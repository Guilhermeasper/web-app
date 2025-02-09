import { Component, inject } from '@angular/core';

import { AccountService } from '@rusbe/services/account/account.service';

@Component({
  selector: 'rusbe-user-avatar',
  imports: [],
  templateUrl: './user-avatar.component.html',
})
export class UserAvatarComponent {
  private accountService = inject(AccountService);
  currentUser = this.accountService.currentUser;

  setFallbackAvatarImage(event: Event) {
    const img = event.target as HTMLImageElement;
    const fallbackAvatarImagePath = '/assets/artworks/avatar.svg';
    if (img && !img.src.endsWith(fallbackAvatarImagePath)) {
      img.src = fallbackAvatarImagePath;
    }
  }
}
