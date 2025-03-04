import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideCopy,
  lucideInfo,
  lucideMoveRight,
  lucideScanQrCode,
  lucideUserRound,
} from '@ng-icons/lucide';

import { CardGroupComponent } from '@rusbe/components/cards/card-group/card-group.component';
import { SpinnerComponent } from '@rusbe/components/spinner/spinner.component';
import { GeneralGoodsPixTransactionData } from '@rusbe/services/general-goods/general-goods.service';

@Component({
  selector: 'rusbe-top-up-pix',
  imports: [CardGroupComponent, NgIcon, SpinnerComponent],
  templateUrl: './top-up-pix.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideCopy,
      lucideScanQrCode,
      lucideCalendarDays,
      lucideUserRound,
      lucideMoveRight,
      lucideInfo,
    }),
  ],
  host: {
    class: 'flex flex-grow flex-col items-start justify-start',
  },
})
export class TopUpPixComponent {
  topUpValue = input.required<string>();
  cpf = input.required<string>();
  name = input.required<string>();
  timeLeft = input.required<string>();

  pixTransactionData = input<GeneralGoodsPixTransactionData | null>();
  pixErrorMessage = input<string>('');

  pixQrCodeSource = computed(() => {
    const pixTransactionData = this.pixTransactionData();
    if (!pixTransactionData) return '';
    return `data:image/png;base64, ${pixTransactionData.qrCodeBase64Image}`;
  });
  parsedTopUpValue = computed(() => parseFloat(this.topUpValue()).toFixed(2));
  parsedCpf = computed(() => {
    const cpfNumber = this.cpf();
    if (!cpfNumber) return '';
    return cpfNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '•••.•••.$3-$4');
  });

  showPixQrCode = signal(false);

  readonly today = new Date();
  readonly formatedDate = `${this.today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}, ${Intl.DateTimeFormat('pt-BR', { hour: 'numeric', minute: 'numeric' }).format(this.today)}`;
}
