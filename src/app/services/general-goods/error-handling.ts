export enum GeneralGoodsLoginError {
  AccountNotFound = 'general-goods/login/account-not-found',
  InvalidCredentials = 'general-goods/login/invalid-credentials',
}

export enum GeneralGoodsRegistrationError {
  EmailAlreadyInUse = 'general-goods/registration/email-already-in-use',
  IdentifierAlreadyRegisteredOrInvalid = 'general-goods/registration/identifier-already-registered-or-invalid',
}

export enum GeneralGoodsAccountRecoveryError {
  InvalidCredentialsOrUnverifiedAccount = 'general-goods/account-recovery/invalid-credentials-or-unverified-account',
}

export enum GeneralGoodsAccountVerificationError {
  AccountNotFound = 'general-goods/account-verification/account-not-found',
  AccountAlreadyVerified = 'general-goods/account-verification/account-already-verified',
}

export enum GeneralGoodsTransactionError {
  Failed = 'general-goods/transaction/failed',
}

export enum GeneralGoodsTokenVerificationError {
  TokenNotAvailable = 'general-goods/token/token-not-available',
  TokenExpired = 'general-goods/token/token-expired',
}

export enum GeneralGoodsRequestError {
  Unauthorized = 'general-goods/request/unauthorized',
  RequestFailedWithUnknownError = 'general-goods/request/request-failed-with-unknown-error',
  ServiceUnavailable = 'general-goods/request/service-unavailable',
}

export type GeneralGoodsError =
  | GeneralGoodsLoginError
  | GeneralGoodsRegistrationError
  | GeneralGoodsAccountRecoveryError
  | GeneralGoodsAccountVerificationError
  | GeneralGoodsTransactionError
  | GeneralGoodsTokenVerificationError
  | GeneralGoodsRequestError;
