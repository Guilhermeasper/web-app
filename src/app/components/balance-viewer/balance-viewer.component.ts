import { NgClass } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { AuthStateService } from '@rusbe/services/auth-state/auth-state.service';
import {
  GeneralGoodsBalanceType,
  GeneralGoodsPartialGrantBalance,
} from '@rusbe/services/general-goods/general-goods.service';
import { MEAL_PRICING_PROFILES } from '@rusbe/services/knowledge/knowledge.service';
import { MealType } from '@rusbe/types/archive';
import { formatArrayAsCommaSeparatedString } from '@rusbe/utils/strings';

@Component({
  selector: 'rusbe-balance-viewer',
  imports: [NgClass],
  templateUrl: './balance-viewer.component.html',
})
export class BalanceViewerComponent {
  private authStateService = inject(AuthStateService);

  colorScheme = input<BalanceViewerColorScheme>(
    BalanceViewerColorScheme.Overlay,
  );

  GeneralGoodsBalanceType = GeneralGoodsBalanceType;
  BalanceViewerColorScheme = BalanceViewerColorScheme;

  balance = computed(() => {
    const accountData = this.authStateService.generalGoodsAccountData();

    if (accountData) {
      return accountData.balance;
    }

    return undefined;
  });

  balanceValue = computed(() => {
    const balance = this.balance();

    if (balance && balance.type === GeneralGoodsBalanceType.PartialGrant) {
      return balance.value.toString();
    }

    return undefined;
  });

  purchasableLunches = computed(() => {
    const balance = this.balance();

    if (balance && balance.type === GeneralGoodsBalanceType.PartialGrant) {
      return this.getPurchaseQuantity(balance, MealType.Lunch);
    }

    return undefined;
  });

  purchasableDinners = computed(() => {
    const balance = this.balance();

    if (balance && balance.type === GeneralGoodsBalanceType.PartialGrant) {
      return this.getPurchaseQuantity(balance, MealType.Dinner);
    }

    return undefined;
  });

  purchasableMealsString = computed(() => {
    const balance = this.balance();

    if (
      balance &&
      (balance.type === GeneralGoodsBalanceType.FullGrant ||
        balance.type === GeneralGoodsBalanceType.FullGrantStudentHousing)
    ) {
      const pricingProfile = MEAL_PRICING_PROFILES.find(
        (profile) => profile.balanceType === balance.type,
      );
      const freeMeals = pricingProfile?.pricing
        .filter((mealPrice) => mealPrice.price.valueInCents === 0)
        .map((mealPrice) => mealPrice.meal);
      if (freeMeals) {
        return formatArrayAsCommaSeparatedString(freeMeals).toLowerCase();
      }
    }

    return undefined;
  });

  // TODO: Move this to utility function
  getPurchaseQuantity(
    balance: GeneralGoodsPartialGrantBalance,
    mealType: MealType,
  ) {
    const mealPricingProfile = MEAL_PRICING_PROFILES.find(
      (profile) => profile.balanceType === balance.type,
    )!;
    const mealPrice = mealPricingProfile.pricing.find(
      (price) => price.meal === mealType,
    )!.price;
    return balance.value.calculatePurchaseQuantity(mealPrice).quantity;
  }
}

export enum BalanceViewerColorScheme {
  Overlay = 'overlay',
  Highlight = 'highlight',
}
