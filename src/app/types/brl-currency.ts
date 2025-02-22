import { RusbeError } from '@rusbe/types/error-handling';

export class BrlCurrency {
  #valueInCents: number;

  static stringFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  static stringWithSymbolFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  private constructor(value: number) {
    this.#valueInCents = value;
  }

  toNumber(): number {
    return this.#valueInCents / 100;
  }

  toString(): string {
    // Output: 1.234,56
    return BrlCurrency.stringFormatter.format(this.#valueInCents / 100);
  }

  toStringWithSymbol(): string {
    // Output: R$ 1.234,56
    return BrlCurrency.stringWithSymbolFormatter.format(
      this.#valueInCents / 100,
    );
  }

  calculatePurchaseQuantity(price: BrlCurrency): PurchaseQuantityResult {
    const quantity = Math.floor(this.#valueInCents / price.valueInCents);
    const remaining = new BrlCurrency(
      this.#valueInCents - quantity * price.valueInCents,
    );
    return { quantity, remaining };
  }

  multiply(value: number): BrlCurrency {
    return new BrlCurrency(this.#valueInCents * value);
  }

  subtract(value: BrlCurrency): BrlCurrency {
    return new BrlCurrency(this.#valueInCents - value.valueInCents);
  }

  add(value: BrlCurrency): BrlCurrency {
    return new BrlCurrency(this.#valueInCents + value.valueInCents);
  }

  get valueInCents(): number {
    return this.#valueInCents;
  }

  static fromNumber(value: number): BrlCurrency {
    return new BrlCurrency(value * 100);
  }

  static fromCents(value: number): BrlCurrency {
    return new BrlCurrency(value);
  }

  static fromHumanReadableString(value: string): BrlCurrency {
    // String format: R$ 1.234,56 or 1.234,56

    const valueInCents = Number.parseInt(
      value.replace('R$', '').replace(',', '').replace('.', ''),
    );

    if (isNaN(valueInCents)) {
      throw new RusbeError(BrlCurrencyError.InvalidCurrencyString, {
        context: { value },
      });
    }

    return new BrlCurrency(valueInCents);
  }

  static fromGeneralGoodsApiString(value: string): BrlCurrency {
    // String format: 1234.56 or 12.3 or 1234

    const [integerPart, decimalPart] = value.split('.');
    let valueInCents = Number.parseInt(integerPart) * 100;

    if (decimalPart) {
      const decimalLength = decimalPart.length;
      const decimalValue =
        Number.parseInt(decimalPart) * Math.pow(10, 2 - decimalLength);
      valueInCents += decimalValue;
    }

    return new BrlCurrency(valueInCents);
  }
}

export interface PurchaseQuantityResult {
  quantity: number;
  remaining: BrlCurrency;
}

export enum BrlCurrencyError {
  InvalidCurrencyString = 'brl-currency/invalid-currency-string',
}
