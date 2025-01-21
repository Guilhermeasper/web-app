import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
import { version } from '@rusbe/environments/version';

@Component({
  selector: 'rusbe-about-page',
  imports: [CommonModule, RouterLink, HeaderComponent, NgIconComponent],
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
export class AboutPageComponent {
  readonly HEADER_TYPE = HeaderType.PageNameWithBackButtonOnColoredBackground;
  readonly APP_VERSION = version;

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
}

export interface SocialNetworkItem {
  icon: string;
  name: string;
  url: string;
}
