import { Component } from '@angular/core';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideClock } from '@ng-icons/lucide';

import {
  HeaderComponent,
  HeaderType,
} from '../../components/header/header.component';
import {
  MEAL_PRICING_PROFILES,
  RESTAURANT_WORKING_HOURS,
} from '../../services/knowledge/knowledge.service';

@Component({
  selector: 'rusbe-operation-page',
  imports: [HeaderComponent, NgIconComponent],
  templateUrl: './operation.component.html',
  viewProviders: [provideIcons({ lucideClock })],
})
export class OperationPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButton;
  readonly MEAL_PRICING_PROFILES = MEAL_PRICING_PROFILES;
  readonly RESTAURANT_WORKING_HOURS = RESTAURANT_WORKING_HOURS;
}
