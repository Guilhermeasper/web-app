export enum AccountServiceError {
  UserNotLoggedIn = 'account-service/user-not-logged-in',
  RequiredUserDataMissing = 'account-service/required-user-data-missing',
  GeneralGoodsIntegrationDataMissing = 'account-service/general-goods-integration-data-missing',
  EncryptionKeyNotFound = 'account-service/encryption-key-not-found',
  GeneralGoodsAccountCreationFailed = 'account-service/general-goods-account-creation-failed',
  GeneralGoodsAccountVerificationEmailFailed = 'account-service/general-goods-account-verification-email-failed',
  GeneralGoodsAccountResetEmailFailed = 'account-service/general-goods-account-reset-email-failed',
  GeneralGoodsAccountLoginFailed = 'account-service/general-goods-account-login-failed',
}
