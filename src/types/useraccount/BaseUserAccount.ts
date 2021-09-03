import _IdAndCaptcha from "../id/_IdAndCaptcha";
import Unique from "../../decorators/typeproperty/Unique";
import { IsAscii, IsString, MaxLength } from "class-validator";
import Private from "../../decorators/typeproperty/Private";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import ReadWrite from "../../decorators/typeproperty/ReadWrite";
import IsSubject from "../../decorators/typeproperty/IsSubject";

export default class BaseUserAccount extends _IdAndCaptcha  {
  @IsUndefined({ groups: ['__backk_update__'] })
  @Unique()
  @IsString()
  @IsSubject()
  @ReadWrite()
  @Private()
  subject!: string;
}
