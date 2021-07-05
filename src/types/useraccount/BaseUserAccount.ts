import _IdAndCaptcha from "../id/_IdAndCaptcha";
import Unique  from "../../decorators/typeproperty/Unique";
import { IsEmail, IsString, MaxLength } from "class-validator";
import { Lengths } from "../../constants/constants";
import IsAnyString from "../../decorators/typeproperty/IsAnyString";
import IsStrongPassword from "../../decorators/typeproperty/IsStrongPassword";
import Private from "../../decorators/typeproperty/Private";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import ReadWrite from "../../decorators/typeproperty/ReadWrite";
import NotUnique from "../../decorators/typeproperty/NotUnique";

export default class BaseUserAccount extends _IdAndCaptcha  {
  @IsUndefined({ groups: ['__backk_update__'] })
  @Unique()
  @IsString()
  @MaxLength(320)
  @IsEmail()
  @ReadWrite()
  @Private()
  userName!: string;

  @IsString()
  @MaxLength(Lengths._512)
  @IsAnyString()
  @ReadWrite()
  @NotUnique()
  public displayName!: string;

  @IsUndefined({ groups: ['__backk_update__'] })
  @IsString()
  @IsStrongPassword()
  @Private()
  @ReadWrite()
  @NotUnique()
  password!: string;
}
