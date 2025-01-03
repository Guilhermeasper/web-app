import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';

@Component({
  selector: 'rusbe-error-page',
  imports: [RouterModule, HeaderComponent, CommonModule],
  templateUrl: './error.component.html',
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  readonly HEADER_TYPE = HeaderType.LogoOnly;

  ErrorType = ErrorType;
  errorType?: ErrorType;

  route = inject(ActivatedRoute);
  routeSubscription?: Subscription;

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.errorType = data['errorType'];
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}

export enum ErrorType {
  NotFound = 'NotFound',
}
