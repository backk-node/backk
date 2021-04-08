import createErrorFromErrorMessageAndThrowError from '../errors/createErrorFromErrorMessageAndThrowError';
import createErrorMessageWithStatusCode from '../errors/createErrorMessageWithStatusCode';

export default async function tryVerifyCaptchaToken(controller: any, captchaToken: string) {
  if (controller['captchaVerifyService']?.['verifyCaptcha']) {
    const isCaptchaVerified = await controller['captchaVerifyService']['verifyCaptcha'](captchaToken);
    if (!isCaptchaVerified) {
      createErrorFromErrorMessageAndThrowError(
        createErrorMessageWithStatusCode('Invalid captcha token', 400)
      );
    }
  } else {
    throw new Error('captchaVerifierService is missing');
  }
}
