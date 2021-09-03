import _IdAndCaptcha from "../id/_IdAndCaptcha";
import Unique from "../../decorators/typeproperty/Unique";
import { IsString, MaxLength } from "class-validator";
import Private from "../../decorators/typeproperty/Private";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import ReadWrite from "../../decorators/typeproperty/ReadWrite";
import IsAnyString from "../../decorators/typeproperty/IsAnyString";

export default class BaseUserAccount extends _IdAndCaptcha  {
  @IsUndefined({ groups: ['__backk_update__'] })
  @Unique()
  @IsString()
  @MaxLength(320)
  @IsAnyString()
  @ReadWrite()
  @Private()
  subject!: string;
}
