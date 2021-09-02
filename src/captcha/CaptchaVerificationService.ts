export default abstract class CaptchaVerificationService {
  abstract verifyCaptcha(captchaToken: string): Promise<boolean>;
}
