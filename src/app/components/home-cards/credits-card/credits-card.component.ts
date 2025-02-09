import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  BalanceViewerColorScheme,
  BalanceViewerComponent,
} from '@rusbe/components/balance-viewer/balance-viewer.component';

@Component({
  selector: 'rusbe-credits-card',
  imports: [RouterModule, BalanceViewerComponent],
  templateUrl: './credits-card.component.html',
})
export class CreditsCardComponent {
  BALANCE_VIEWER_COLOR_SCHEME = BalanceViewerColorScheme.Highlight;
}
