import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';

@Component({
  selector: 'rusbe-legal-privacy-page',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './privacy.component.html',
})
export class LegalPrivacyPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButton;
}
