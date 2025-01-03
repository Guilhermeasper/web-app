import { CommonModule } from '@angular/common';
import { Component, computed, input, linkedSignal } from '@angular/core';

import { MAIN_COURSE_NAME } from '@rusbe/services/knowledge/knowledge.service';
import { ArchiveEntry } from '@rusbe/types/archive';
import { modulo } from '@rusbe/utils/numbers';

@Component({
  selector: 'rusbe-restaurant-menu-viewer',
  imports: [CommonModule],
  templateUrl: './restaurant-menu-viewer.component.html',
})
export class RestaurantMenuViewerComponent {
  readonly MAIN_COURSE_NAME = MAIN_COURSE_NAME;
  readonly MEAL_TAB_ID_PREFIX = 'meal-tab-';
  readonly MEAL_TABPANEL_ID_PREFIX = 'meal-tabpanel-';

  archiveEntry = input.required<ArchiveEntry | undefined | null>();

  availableMealTypes = computed(() => {
    return this.archiveEntry()?.operationDay.meals.map((meal) => meal.type);
  });
  selectedMealIndex = linkedSignal<string[] | undefined, number | undefined>({
    source: this.availableMealTypes,
    computation: (newAvailableMealTypes, currentlySelectedMealIndex) => {
      // TODO: Improve this logic

      // If there are no available meal types, return undefined.
      if (!newAvailableMealTypes || newAvailableMealTypes.length === 0) {
        return undefined;
      }

      // If the `currentlySelectedMealIndex` is not defined, default to the first option.
      if (currentlySelectedMealIndex?.value === undefined) {
        return 0;
      }

      // If the `newAvailableMealTypes` contain the previously selected option, preserve that selection.
      // Otherwise, default to the first option.
      const currentMealType =
        this.availableMealTypes()?.[currentlySelectedMealIndex.value];

      if (currentMealType) {
        return newAvailableMealTypes.indexOf(currentMealType) ?? 0;
      }

      return 0;
    },
  });

  lastUpdatedAtString = computed(() => {
    const lastUpdatedAt = this.archiveEntry()?.lastUpdatedAt;

    if (!lastUpdatedAt) {
      return undefined;
    }

    return lastUpdatedAt.toLocaleString('pt-BR');
  });

  selectMeal(index: number) {
    this.selectedMealIndex.set(index);
  }

  handleKeypressOnTabSelector(currentIndex: number, event: KeyboardEvent) {
    const availableMealTypes = this.availableMealTypes()!;
    let keypressHandled = false;

    switch (event.key) {
      case 'ArrowLeft':
        this.moveFocusToTabSelector(
          modulo(currentIndex - 1, availableMealTypes.length),
        );
        keypressHandled = true;
        break;

      case 'ArrowRight':
        this.moveFocusToTabSelector(
          modulo(currentIndex + 1, availableMealTypes.length),
        );
        keypressHandled = true;
        break;

      case 'Home':
        this.moveFocusToTabSelector(0);
        keypressHandled = true;
        break;

      case 'End':
        this.moveFocusToTabSelector(availableMealTypes.length - 1);
        keypressHandled = true;
        break;

      default:
        break;
    }

    if (keypressHandled) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  moveFocusToTabSelector(index: number) {
    document.getElementById(`${this.MEAL_TAB_ID_PREFIX}${index}`)?.focus();
  }
}
