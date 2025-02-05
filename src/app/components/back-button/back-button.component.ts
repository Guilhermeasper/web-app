import { CommonModule, Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';

@Component({
  selector: 'rusbe-back-button',
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ lucideChevronLeft })],
  templateUrl: './back-button.component.html',
})
export class BackButtonComponent {
  colorScheme = input<BackButtonColorScheme>(BackButtonColorScheme.Page);
  BackButtonColorScheme = BackButtonColorScheme;

  router = inject(Router);
  location = inject(Location);

  goBack() {
    if (this.router.lastSuccessfulNavigation != null) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}

export enum BackButtonColorScheme {
  Page = 'page',
  ColoredBackground = 'colored-background',
}
