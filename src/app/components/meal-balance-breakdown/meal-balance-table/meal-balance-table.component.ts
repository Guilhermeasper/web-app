import { LowerCasePipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MealType } from '@rusbe/types/archive';
import { BrlCurrency } from '@rusbe/types/brl-currency';

import { CalculationType } from '../meal-balance-breakdown.component';

@Component({
  selector: 'rusbe-meal-balance-table',
  imports: [NgIf, LowerCasePipe],
  templateUrl: './meal-balance-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealBalanceTableComponent {
  @Input() mealType: MealType = MealType.Lunch;
  @Input() calculationType: CalculationType = 'equivalence';
  @Input() mealValue = BrlCurrency.fromNumber(0);
  @Input() mealCount = 0;
  @Input() totalCost = BrlCurrency.fromNumber(0);
  @Input() balanceLeft = BrlCurrency.fromNumber(0);
}
