import _IdAndCaptcha from "../id/_IdAndCaptcha";
import Unique from "../../decorators/typeproperty/Unique";
import { IsString, MaxLength } from "class-validator";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import IsSubject from "../../decorators/typeproperty/IsSubject";
import CreateOnly from "../../decorators/typeproperty/access/CreateOnly";

export default class BaseUserAccount extends _IdAndCaptcha  {
  @IsUndefined({ groups: ['__backk_update__'] })
  @Unique()
  @IsString()
  @MaxLength(255)
  @IsSubject()
  @CreateOnly()
  subject!: string;
}
