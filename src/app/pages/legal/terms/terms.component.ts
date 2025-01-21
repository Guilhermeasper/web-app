import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';

@Component({
  selector: 'rusbe-legal-terms-page',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './terms.component.html',
})
export class LegalTermsPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButton;
}
