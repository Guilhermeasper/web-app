import { CommonModule, Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';

import { ButtonColorScheme } from '@rusbe/components/header/button-color-scheme';

@Component({
  selector: 'rusbe-close-button',
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ lucideX })],
  templateUrl: './close-button.component.html',
})
export class CloseButtonComponent {
  colorScheme = input<ButtonColorScheme>(ButtonColorScheme.Page);
  ButtonColorScheme = ButtonColorScheme;

  router = inject(Router);
  location = inject(Location);

  close() {
    this.router.navigate(['/']);
  }
}
