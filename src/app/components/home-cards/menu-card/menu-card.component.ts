import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject, resource } from '@angular/core';
import { RouterModule } from '@angular/router';

import { differenceInCalendarDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';

import { ArchiveService } from '@rusbe/services/archive/archive.service';
import {
  KnowledgeService,
  MAIN_COURSE_NAME,
  MostRelevantArchiveEntryInfo,
} from '@rusbe/services/knowledge/knowledge.service';
import { MealSet } from '@rusbe/types/archive';

@Component({
  selector: 'rusbe-menu-card',
  imports: [CommonModule, RouterModule, NgIconComponent],
  templateUrl: './menu-card.component.html',
  viewProviders: [provideIcons({ lucideChevronRight })],
})
export class MenuCardComponent {
  MenuCardComponentState = MenuCardComponentState;

  private knowledgeService = inject(KnowledgeService);
  private archiveService = inject(ArchiveService);

  mostRelevantArchiveEntryInfo: Signal<
    MostRelevantArchiveEntryInfo | undefined
  > = this.knowledgeService.mostRelevantArchiveEntryInfo;

  state = computed(() => {
    const archiveEntryInfo = this.mostRelevantArchiveEntryInfo();

    if (!archiveEntryInfo) {
      return MenuCardComponentState.Loading;
    }

    if (archiveEntryInfo.isMenuRelevant) {
      return MenuCardComponentState.LinkOnly;
    }

    return MenuCardComponentState.MealSetPreview;
  });

  highlightedArchiveEntry = resource({
    request: () => ({ archiveEntryInfo: this.mostRelevantArchiveEntryInfo() }),
    loader: ({ request }) =>
      (async () => {
        if (request.archiveEntryInfo) {
          return await this.archiveService.getArchiveEntryFromDateString(
            request.archiveEntryInfo.title,
          );
        }

        return undefined;
      })(),
  });

  highlightedMealSet = computed<MealSet | undefined>(() => {
    const archiveEntry = this.highlightedArchiveEntry.value();
    const archiveEntryInfo = this.mostRelevantArchiveEntryInfo();

    return archiveEntry?.operationDay.meals
      .find((meal) => meal.type === archiveEntryInfo?.mealType)
      ?.sets.find((meal) => meal.name === MAIN_COURSE_NAME);
  });

  highlightedMealType = computed(() => {
    const archiveEntryInfo = this.mostRelevantArchiveEntryInfo();

    if (!archiveEntryInfo) {
      return undefined;
    }

    return archiveEntryInfo.mealType;
  });

  highlightedDayHint = computed(() => {
    const archiveEntry = this.highlightedArchiveEntry.value();
    const archiveEntryInfo = this.mostRelevantArchiveEntryInfo();

    if (!archiveEntryInfo || !archiveEntry) {
      return 'Cardápio';
    }

    const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
    const daysDifference = differenceInCalendarDays(
      this.knowledgeService.getDateInRestaurantTimezone(
        archiveEntry.operationDay.date,
      ),
      this.knowledgeService.getDateInRestaurantTimezone(),
    );

    if (Math.abs(daysDifference) > 1) {
      return `Cardápio de ${format(this.knowledgeService.getDateInRestaurantTimezone(archiveEntry.operationDay.date), 'EEEE', { locale: ptBR })}`;
    }

    const relativeDay = formatter.format(daysDifference, 'day');

    return `Cardápio de ${relativeDay}`;
  });
}

enum MenuCardComponentState {
  Loading = 'Loading',
  MealSetPreview = 'MealSetPreview',
  LinkOnly = 'LinkOnly',
}
