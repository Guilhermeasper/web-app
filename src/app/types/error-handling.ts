import { HttpErrorResponse } from '@angular/common/http';

export class RusbeError extends Error {
  public readonly context?: object;

  constructor(
    message: string,
    options: { cause?: Error; context?: object } = {},
  ) {
    const { cause, context } = options;

    super(message, { cause });
    this.name = this.constructor.name;

    this.context = context;
  }
}

export function ensureError(value: unknown): Error {
  // HttpErrorResponse is included here because it implements Error interface rather than
  // extending Error class, so the instanceof operator can't be used.
  if (value instanceof Error || value instanceof HttpErrorResponse)
    return value;

  try {
    const stringifiedValue = JSON.stringify(value);
    return new RusbeError(MetaError.ErrorValueNotInstanceOfError, {
      context: { stringifiedValue },
    });
  } catch {
    return new RusbeError(MetaError.ErrorValueNotInstanceOfError);
  }
}

export enum MetaError {
  ErrorValueNotInstanceOfError = 'meta/error-value-not-instance-of-error',
}
