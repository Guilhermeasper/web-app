import { NgFor, NgIf, SlicePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';

import { MealPricingProfile } from '@rusbe/services/knowledge/knowledge.service';
import { MEAL_PRICING_PROFILES } from '@rusbe/services/knowledge/knowledge.service';
import { BrlCurrency } from '@rusbe/types/brl-currency';

import { MealBalanceTableComponent } from './meal-balance-table/meal-balance-table.component';

@Component({
  selector: 'rusbe-meal-balance-breakdown',
  imports: [MealBalanceTableComponent, NgFor, NgIf, SlicePipe],
  templateUrl: './meal-balance-breakdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-5' },
})
export class MealBalanceBreakdownComponent implements OnInit, OnChanges {
  @Input() calculationType: CalculationType = 'equivalence';
  @Input() mealPrincingProfile: MealPricingProfile = MEAL_PRICING_PROFILES[1];
  @Input() numberOfDinners = 0;
  @Input() numberOfLunches = 0;

  @Input() get topUpValue(): BrlCurrency {
    return this._topUpValue;
  }
  set topUpValue(value: number) {
    this._topUpValue = BrlCurrency.fromNumber(value);
    this.refreshMealCalculations();
  }

  public totalMealsCost = BrlCurrency.fromNumber(0);
  public mealSummaryList: MealSummary[] = [
    {
      mealCount: 0,
      totalCost: BrlCurrency.fromNumber(0),
      balanceLeft: BrlCurrency.fromNumber(0),
    },
    {
      mealCount: 0,
      totalCost: BrlCurrency.fromNumber(0),
      balanceLeft: BrlCurrency.fromNumber(0),
    },
  ];

  private _topUpValue = BrlCurrency.fromNumber(0);

  public ngOnInit(): void {
    this.refreshMealCalculations();
  }

  public ngOnChanges(): void {
    this.refreshMealCalculations();
  }

  private refreshMealCalculations(): void {
    if (this.calculationType === 'equivalence') {
      this.updateCalculatedMeals();
    } else {
      this.mealSummaryList = [
        this.createMealCountDetails(MealIndex.Lunch, this.numberOfLunches),
        this.createMealCountDetails(MealIndex.Dinner, this.numberOfDinners),
      ];
    }
    this.updateTotalMealsCost();
  }

  private updateTotalMealsCost(): void {
    this.totalMealsCost = this.mealPrincingProfile.pricing[
      MealIndex.Lunch
    ].price
      .multiply(this.mealSummaryList[MealIndex.Lunch - 1].mealCount)
      .add(
        this.mealPrincingProfile.pricing[MealIndex.Dinner].price.multiply(
          this.mealSummaryList[MealIndex.Dinner - 1].mealCount,
        ),
      );
  }

  private updateCalculatedMeals(): void {
    this.mealSummaryList = [
      this.createMealCountDetails(MealIndex.Lunch),
      this.createMealCountDetails(MealIndex.Dinner),
    ];
  }

  private createMealCountDetails(
    mealIndex: MealIndex,
    numberOfMeals: number,
  ): MealSummary;
  private createMealCountDetails(mealIndex: MealIndex): MealSummary;

  private createMealCountDetails(
    mealIndex: MealIndex,
    numberOfMeals?: number,
  ): MealSummary {
    if (numberOfMeals) {
      return {
        mealCount: numberOfMeals,
        totalCost:
          this.mealPrincingProfile.pricing[mealIndex].price.multiply(
            numberOfMeals,
          ),
        balanceLeft: BrlCurrency.fromNumber(0),
      };
    }

    const { quantity, remaining } = this.topUpValue.calculatePurchaseQuantity(
      this.mealPrincingProfile.pricing[mealIndex].price,
    );
    return {
      mealCount: quantity,
      totalCost:
        this.mealPrincingProfile.pricing[mealIndex].price.multiply(quantity),
      balanceLeft: remaining,
    };
  }
}

interface MealSummary {
  mealCount: number;
  totalCost: BrlCurrency;
  balanceLeft: BrlCurrency;
}

export type CalculationType = 'equivalence' | 'details';

enum MealIndex {
  Lunch = 1,
  Dinner = 2,
}
