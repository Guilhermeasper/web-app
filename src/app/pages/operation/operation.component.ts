import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideClock } from '@ng-icons/lucide';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { AuthStateService } from '@rusbe/services/auth-state/auth-state.service';
import { GeneralGoodsBalanceType } from '@rusbe/services/general-goods/general-goods.service';
import {
  MEAL_PRICING_PROFILES,
  RESTAURANT_WORKING_HOURS,
} from '@rusbe/services/knowledge/knowledge.service';

@Component({
  selector: 'rusbe-operation-page',
  imports: [NgClass, HeaderComponent, NgIconComponent],
  templateUrl: './operation.component.html',
  viewProviders: [provideIcons({ lucideClock })],
})
export class OperationPageComponent implements AfterViewInit {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButton;
  readonly MEAL_PRICING_PROFILES = MEAL_PRICING_PROFILES;
  readonly RESTAURANT_WORKING_HOURS = RESTAURANT_WORKING_HOURS;

  @ViewChild('pricingProfileCards')
  pricingProfileCards!: ElementRef<HTMLDivElement>;

  authStateService = inject(AuthStateService);

  isReadyToInteract = signal<boolean>(false);

  userBalanceType = computed(() => {
    const accountData = this.authStateService.generalGoodsAccountData();

    if (accountData) {
      return accountData.balance.type;
    }

    return undefined;
  });

  constructor() {
    effect(() => {
      const isReadyToInteract = this.isReadyToInteract();
      const balanceType = this.userBalanceType();

      if (isReadyToInteract && balanceType) {
        this.scrollToMealPriceProfileCard(balanceType);
      }
    });
  }

  ngAfterViewInit() {
    this.isReadyToInteract.set(true);
  }

  scrollToMealPriceProfileCard(balanceType: GeneralGoodsBalanceType) {
    if (this.pricingProfileCards === undefined) {
      return;
    }

    const cardIndex = MEAL_PRICING_PROFILES.findIndex(
      (mealPriceProfile) => mealPriceProfile.balanceType === balanceType,
    );

    if (cardIndex === -1) {
      return;
    }

    const targetCard = this.pricingProfileCards.nativeElement.children[
      cardIndex
    ] as HTMLDivElement;

    requestAnimationFrame(() => {
      this.pricingProfileCards.nativeElement.scrollTo({
        left: targetCard.offsetLeft,
        behavior: 'smooth',
      });
    });
  }
}
