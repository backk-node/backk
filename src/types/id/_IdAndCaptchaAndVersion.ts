import _IdAndCaptcha from "./_IdAndCaptcha";
import { Max, Min } from "class-validator";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import IsBigInt from "../../decorators/typeproperty/IsBigInt";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCaptchaAndVersion extends _IdAndCaptcha {
  @IsUndefined({groups: ['__backk_create__']})
  @IsBigInt({ groups: ['__backk_none__'] })
  @Min(-1)
  @Max(Number.MAX_SAFE_INTEGER)
  public version!: number;
}
