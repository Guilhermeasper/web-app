import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalculator,
  lucideFolderClock,
  lucideInfo,
  lucideMegaphone,
  lucideWallet,
} from '@ng-icons/lucide';

const ICONS = {
  lucideWallet,
  lucideCalculator,
  lucideMegaphone,
  lucideInfo,
  lucideFolderClock,
};

@Component({
  selector: 'rusbe-link-card',
  imports: [RouterModule, NgIconComponent],
  templateUrl: './link-card.component.html',
  viewProviders: [provideIcons(ICONS)],
})
export class LinkCardComponent {
  iconName = input.required<keyof typeof ICONS>();
  destination = input.required<string>();
}
