import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject, resource } from '@angular/core';
import { RouterModule } from '@angular/router';

import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { ArchiveService } from '../../../services/archive/archive.service';
import {
  KnowledgeService,
  OperationClosedStatus,
  OperationOpenStatus,
  OperationStatus,
  OperationStatusType,
} from '../../../services/knowledge/knowledge.service';

@Component({
  selector: 'rusbe-status-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './status-card.component.html',
})
export class StatusCardComponent {
  StatusCardComponentState = StatusCardComponentState;
  OperationStatusType = OperationStatusType;

  private knowledgeService = inject(KnowledgeService);
  private archiveService = inject(ArchiveService);

  operationStatus: Signal<OperationStatus | undefined> =
    this.knowledgeService.currentOperationStatus;

  state = computed(() => {
    if (!this.operationStatus()) {
      return StatusCardComponentState.Loading;
    }

    return StatusCardComponentState.ShowingStatus;
  });

  currentMealType = computed(() => {
    const status = this.operationStatus();

    return (
      (status as OperationOpenStatus)?.servingMeal ??
      (status as OperationClosedStatus)?.nextMilestone?.meal
    );
  });

  currentMealTypeServingTime = computed(() => {
    const currentMealType = this.currentMealType();
    const currentArchiveEntry = this.currentArchiveEntry.value();

    if (!currentMealType || !currentArchiveEntry) {
      return undefined;
    }

    const meal = currentArchiveEntry.operationDay.meals.find(
      (meal) => meal.type === currentMealType,
    )!;
    const startTime = this.formatTime(meal.startTime);
    const endTime = this.formatTime(meal.endTime);

    return `${startTime} às ${endTime}`;
  });

  currentArchiveEntry = resource({
    request: () => ({ operationStatus: this.operationStatus() }),
    loader: ({ request }) =>
      (async () => {
        if (request.operationStatus?.sourceArchiveEntryDateString) {
          return await this.archiveService.getArchiveEntryFromDateString(
            request.operationStatus.sourceArchiveEntryDateString,
          );
        }

        return undefined;
      })(),
  });

  nextMilestoneRelativeTime = computed(() => {
    const nextMilestoneTime = this.operationStatus()?.nextMilestone?.time;

    if (!nextMilestoneTime) {
      return undefined;
    }

    return formatDistanceToNowStrict(nextMilestoneTime, {
      locale: ptBR,
    });
  });

  formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return minutes === 0 ? `${hours}h` : `${hours}h${minutes}`;
  }
}

enum StatusCardComponentState {
  Loading = 'Loading',
  ShowingStatus = 'ShowingStatus',
}
