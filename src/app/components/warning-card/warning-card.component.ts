import { Component } from '@angular/core';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert } from '@ng-icons/lucide';

@Component({
  selector: 'rusbe-warning-card',
  imports: [NgIconComponent],
  templateUrl: './warning-card.component.html',
  viewProviders: [provideIcons({ lucideCircleAlert })],
})
export class WarningCardComponent {}
