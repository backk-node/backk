import { IsAscii, IsString, MaxLength } from "class-validator";
import Transient from "../decorators/typeproperty/Transient";
import { Lengths } from "../constants/constants";
import IsUndefined from "../decorators/typeproperty/IsUndefined";
import CreateOnly from "../decorators/typeproperty/access/CreateOnly";

export default class Captcha {
  @IsUndefined({ groups: ['__backk_update__'] })
  @Transient()
  @CreateOnly()
  @IsString()
  @MaxLength(Lengths._512)
  @IsAscii()
  captchaToken!: string;
}
