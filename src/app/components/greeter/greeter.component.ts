import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject, resource } from '@angular/core';

import { format, getHours, lightFormat } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import {
  ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
  ArchiveService,
} from '@rusbe/services/archive/archive.service';
import {
  KnowledgeService,
  MostRelevantArchiveEntryInfo,
  RESTAURANT_REGULARLY_OPEN_DAYS,
} from '@rusbe/services/knowledge/knowledge.service';
import { formatArrayAsCommaSeparatedString } from '@rusbe/utils/strings';

@Component({
  selector: 'rusbe-greeter',
  imports: [CommonModule],
  templateUrl: './greeter.component.html',
})
export class GreeterComponent {
  private knowledgeService = inject(KnowledgeService);
  private archiveService = inject(ArchiveService);

  mostRelevantArchiveEntryInfo: Signal<
    MostRelevantArchiveEntryInfo | undefined
  > = this.knowledgeService.mostRelevantArchiveEntryInfo;

  todayArchiveEntry = resource({
    request: () => ({ archiveEntryInfo: this.mostRelevantArchiveEntryInfo() }),
    loader: ({ request }) =>
      (async () => {
        if (request.archiveEntryInfo) {
          return await this.archiveService.getArchiveEntryFromDateString(
            lightFormat(
              this.knowledgeService.getDateInRestaurantTimezone(),
              ARCHIVE_ENTRY_FILENAME_DATE_FORMAT,
            ),
          );
        }

        return undefined;
      })(),
  });

  servedMealsInfo = computed<string | undefined>(() => {
    const archiveEntry = this.todayArchiveEntry.value();

    if (archiveEntry === undefined) {
      // Knowledge Service is still loading
      return undefined;
    }

    if (archiveEntry === null) {
      // No archive entry for today
      const today = this.knowledgeService.getDateInRestaurantTimezone();
      const todayWeekday = format(today, 'EEEE', {
        locale: ptBR,
      });
      if (RESTAURANT_REGULARLY_OPEN_DAYS.includes(todayWeekday)) {
        return 'O cardápio para hoje não foi publicado.';
      } else {
        return 'O RU não opera hoje.';
      }
    }

    const mealsArray = archiveEntry.operationDay.meals.map((meal) => meal.type);

    if (mealsArray.length === 0) {
      return 'O RU não opera hoje.';
    }

    return `O RU está operando hoje para ${formatArrayAsCommaSeparatedString(mealsArray).toLowerCase()}.`;
  });

  greeting = computed(() => {
    this.mostRelevantArchiveEntryInfo();

    const now = new Date();
    const currentHour = getHours(now);

    if (currentHour >= 0 && currentHour < 12) {
      return 'Bom dia';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  });
}
