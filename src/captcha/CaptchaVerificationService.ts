export interface CaptchaVerificationService {
  verifyCaptcha(captchaToken: string): Promise<boolean>;
}
