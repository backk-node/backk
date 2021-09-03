import createErrorFromErrorMessageAndThrowError from '../errors/createErrorFromErrorMessageAndThrowError';
import createErrorMessageWithStatusCode from '../errors/createErrorMessageWithStatusCode';
import getMicroserviceServiceByServiceClass from '../microservice/getMicroserviceServiceByServiceClass';
import CaptchaVerificationService from './CaptchaVerificationService';

export default async function tryVerifyCaptchaToken(microservice: any, captchaToken: string) {
  const captchaService = getMicroserviceServiceByServiceClass(microservice, CaptchaVerificationService);

  if (captchaService?.verifyCaptcha) {
    const isCaptchaVerified = await captchaService.verifyCaptcha(captchaToken);

    if (!isCaptchaVerified) {
      createErrorFromErrorMessageAndThrowError(
        createErrorMessageWithStatusCode('Invalid captcha token', 400)
      );
    }
  } else {
    throw new Error(
      'Captcha verification service is missing. You must implement a captcha verification service class that extends CaptchaVerificationService and instantiate your class and store in a field in MicroserviceImpl class'
    );
  }
}
