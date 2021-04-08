import { IsAscii, IsString, MaxLength } from "class-validator";
import { Transient } from "../decorators/typeproperty/Transient";
import { Lengths } from "../constants/constants";

export default class Captcha {
  @Transient()
  @IsString()
  @MaxLength(Lengths._512)
  @IsAscii()
  captchaToken!: string;
}
