import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  faBrandGithub,
  faBrandInstagram,
  faBrandTiktok,
  faBrandXTwitter,
} from '@ng-icons/font-awesome/brands';

import {
  HeaderComponent,
  HeaderType,
} from '@rusbe/components/header/header.component';
import { SpinnerComponent } from '@rusbe/components/spinner/spinner.component';
import { version } from '@rusbe/environments/version';

@Component({
  selector: 'rusbe-about-page',
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    NgIconComponent,
    SpinnerComponent,
  ],
  templateUrl: './about.component.html',
  viewProviders: [
    provideIcons({
      faBrandInstagram,
      faBrandTiktok,
      faBrandXTwitter,
      faBrandGithub,
    }),
  ],
})
export class AboutPageComponent implements OnInit {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButtonOnColoredBackground;
  readonly APP_VERSION = version;

  readonly swUpdate = inject(SwUpdate);

  readonly ServiceWorkerUpdateStatus = ServiceWorkerUpdateStatus;
  serviceWorkerUpdateStatus: ServiceWorkerUpdateStatus =
    ServiceWorkerUpdateStatus.Initializing;

  readonly socialNetworks: SocialNetworkItem[] = [
    {
      icon: 'faBrandInstagram',
      name: 'Instagram',
      url: 'https://instagr.am/rusbeapp',
    },
    {
      icon: 'faBrandTiktok',
      name: 'TikTok',
      url: 'https://tiktok.com/@rusbeapp',
    },
    {
      icon: 'faBrandXTwitter',
      name: 'Twitter',
      url: 'https://twitter.com/rusbeapp',
    },
    {
      icon: 'faBrandGithub',
      name: 'GitHub',
      url: 'https://github.com/rusbeapp',
    },
  ];

  ngOnInit() {
    this.checkForUpdates();
  }

  async checkForUpdates() {
    if (!this.swUpdate.isEnabled) {
      this.serviceWorkerUpdateStatus = ServiceWorkerUpdateStatus.Unavailable;
      return;
    }

    this.serviceWorkerUpdateStatus =
      ServiceWorkerUpdateStatus.CheckingForUpdate;

    try {
      const updateAvailable = await this.swUpdate.checkForUpdate();

      if (updateAvailable) {
        this.serviceWorkerUpdateStatus = ServiceWorkerUpdateStatus.UpdateReady;
      } else {
        this.serviceWorkerUpdateStatus = ServiceWorkerUpdateStatus.Updated;
      }
    } catch {
      this.serviceWorkerUpdateStatus =
        ServiceWorkerUpdateStatus.ErrorWhileChecking;
    }
  }

  reload() {
    window.location.reload();
  }
}

export interface SocialNetworkItem {
  icon: string;
  name: string;
  url: string;
}

export enum ServiceWorkerUpdateStatus {
  Initializing = 'initializing',
  Unavailable = 'unavailable',
  CheckingForUpdate = 'checking-for-update',
  ErrorWhileChecking = 'error-while-checking',
  UpdateReady = 'update-ready',
  Updated = 'updated',
}
