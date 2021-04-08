import { IsAscii, IsString, MaxLength } from "class-validator";
import _Id from "./_Id";
import { Transient } from "../../decorators/typeproperty/Transient";
import { Lengths } from "../../constants/constants";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCaptcha extends _Id {
  @Transient()
  @IsString()
  @MaxLength(Lengths._512)
  @IsAscii()
  public captchaToken!: string;
}
