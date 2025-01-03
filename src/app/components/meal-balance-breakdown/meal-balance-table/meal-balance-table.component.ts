import { LowerCasePipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
  mealType = input<MealType>(MealType.Lunch);
  calculationType = input<CalculationType>(CalculationType.Equivalence);
  mealValue = input(BrlCurrency.fromNumber(0));
  mealCount = input(0);
  totalCost = input(BrlCurrency.fromNumber(0));
  balanceLeft = input(BrlCurrency.fromNumber(0));
}
