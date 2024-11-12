import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import {
  BackButtonColorScheme,
  BackButtonComponent,
} from '../back-button/back-button.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'rusbe-header',
  imports: [CommonModule, LogoComponent, BackButtonComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  HeaderType = HeaderType;
  BackButtonColorScheme = BackButtonColorScheme;

  type = input<HeaderType>(HeaderType.LogoOnly);

  readonly backButtonColorSchemeMap: Partial<
    Record<HeaderType, BackButtonColorScheme>
  > = {
    [HeaderType.PageNameWithBackButton]: BackButtonColorScheme.Page,
    [HeaderType.PageNameWithBackButtonOnColoredBackground]:
      BackButtonColorScheme.ColoredBackground,
  };
}

export enum HeaderType {
  LogoOnly = 'logo-only',
  PageNameWithBackButton = 'page-name-with-back-button',
  PageNameWithBackButtonOnColoredBackground = 'page-name-with-back-button-on-colored-background',
}
