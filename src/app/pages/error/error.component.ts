import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  HeaderComponent,
  HeaderType,
} from '../../components/header/header.component';

@Component({
  selector: 'rusbe-error-page',
  imports: [RouterModule, HeaderComponent, CommonModule],
  templateUrl: './error.component.html',
})
export class ErrorPageComponent implements OnInit {
  readonly HEADER_TYPE = HeaderType.LogoOnly;

  ErrorType = ErrorType;
  errorType?: ErrorType;

  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.errorType = data['errorType'];
    });
  }
}

export enum ErrorType {
  NotFound = 'NotFound',
}
