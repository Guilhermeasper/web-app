import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GreeterComponent } from '@rusbe/components/greeter/greeter.component';
import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { CreditsCardComponent } from '@rusbe/components/home-cards/credits-card/credits-card.component';
import { LinkCardComponent } from '@rusbe/components/home-cards/link-card/link-card.component';
import { MenuCardComponent } from '@rusbe/components/home-cards/menu-card/menu-card.component';
import { SignInCardComponent } from '@rusbe/components/home-cards/sign-in-card/sign-in-card.component';
import { StatusCardComponent } from '@rusbe/components/home-cards/status-card/status-card.component';
import { WarningCardComponent } from '@rusbe/components/warning-card/warning-card.component';
import { KnowledgeService } from '@rusbe/services/knowledge/knowledge.service';

@Component({
  selector: 'rusbe-home-page',
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    GreeterComponent,
    MenuCardComponent,
    LinkCardComponent,
    CreditsCardComponent,
    StatusCardComponent,
    SignInCardComponent,
    WarningCardComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomePageComponent {
  readonly HEADER_TYPE = HeaderType.LogoOnly;
  knowledgeService = inject(KnowledgeService);

  public isInRestaurantTimezone =
    this.knowledgeService.isDeviceInRestaurantTimezone();
}
