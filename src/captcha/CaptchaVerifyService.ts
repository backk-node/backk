export default abstract class CaptchaVerifyService{
  abstract verifyCaptcha(captchaToken: string): Promise<boolean>;
}
