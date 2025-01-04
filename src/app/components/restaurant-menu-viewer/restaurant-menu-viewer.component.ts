import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';

import {
  KnowledgeService,
  MAIN_COURSE_NAME,
} from '@rusbe/services/knowledge/knowledge.service';
import { PreferencesService } from '@rusbe/services/preferences/preferences.service';
import { ArchiveEntry, Meal, MealType } from '@rusbe/types/archive';
import { modulo } from '@rusbe/utils/numbers';
import { stripTimeFromIsoDateTimeString } from '@rusbe/utils/strings';

@Component({
  selector: 'rusbe-restaurant-menu-viewer',
  imports: [CommonModule],
  templateUrl: './restaurant-menu-viewer.component.html',
})
export class RestaurantMenuViewerComponent {
  readonly MAIN_COURSE_NAME = MAIN_COURSE_NAME;
  readonly MEAL_TAB_ID_PREFIX = 'meal-tab-';
  readonly MEAL_TABPANEL_ID_PREFIX = 'meal-tabpanel-';

  knowledgeService = inject(KnowledgeService);
  preferencesService = inject(PreferencesService);

  archiveEntry = input.required<ArchiveEntry | undefined | null>();

  availableMealTypes = computed(() => {
    return this.archiveEntry()?.operationDay.meals.map((meal) => meal.type);
  });

  selectedMealIndex = linkedSignal<string[] | undefined, number | undefined>({
    source: this.availableMealTypes,
    computation: (newAvailableMealTypes, currentlySelectedMealIndex) => {
      // If there are no available meal types, return undefined.
      if (!newAvailableMealTypes || newAvailableMealTypes.length === 0) {
        return undefined;
      }

      if (currentlySelectedMealIndex?.value === undefined) {
        // If the `currentlySelectedMealIndex` is not defined, check if the selected archive entry is the one deemed most relevant.
        const archiveEntry = this.archiveEntry();
        const mostRelevantArchiveEntryInfo =
          this.knowledgeService.mostRelevantArchiveEntryInfo();

        // If so, select the most relevant meal type.
        if (
          archiveEntry &&
          mostRelevantArchiveEntryInfo &&
          stripTimeFromIsoDateTimeString(
            archiveEntry.operationDay.date.toISOString(),
          ) === mostRelevantArchiveEntryInfo.title &&
          newAvailableMealTypes.includes(mostRelevantArchiveEntryInfo.mealType)
        ) {
          return newAvailableMealTypes.indexOf(
            mostRelevantArchiveEntryInfo.mealType,
          );
        }

        // If not, try to find the first option that is a relevant meal type per the user preferences.
        const relevantMeals =
          this.preferencesService.userPreferences()?.relevantMeals;

        if (relevantMeals) {
          const relevantMealType = newAvailableMealTypes.find((mealType) =>
            relevantMeals.includes(mealType as MealType),
          );

          if (relevantMealType) {
            return newAvailableMealTypes.indexOf(relevantMealType);
          }
        }

        // Otherwise, default to the first option.
        return 0;
      }

      // If the `newAvailableMealTypes` contain the previously selected option, preserve that selection.
      // Otherwise, default to the first option.
      const currentMealType =
        this.availableMealTypes()?.[currentlySelectedMealIndex.value];

      if (currentMealType && newAvailableMealTypes.includes(currentMealType)) {
        return newAvailableMealTypes.indexOf(currentMealType);
      }

      return 0;
    },
  });

  meals = computed(() => {
    const archiveMeals = this.archiveEntry()?.operationDay.meals;

    if (!archiveMeals) {
      return undefined;
    }

    if (this.preferencesService.userPreferences()?.showMainCourseOnTop) {
      const meals: Meal[] = archiveMeals.map((meal) => {
        const mainCourse = meal.sets.find(
          (set) => set.name === MAIN_COURSE_NAME,
        );

        if (!mainCourse) {
          return meal;
        }

        const filteredSets = meal.sets.filter(
          (set) => set.name !== MAIN_COURSE_NAME,
        );
        return {
          type: meal.type,
          sets: [mainCourse, ...filteredSets],
          startTime: meal.startTime,
          endTime: meal.endTime,
        };
      });

      return meals;
    }

    return archiveMeals;
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
