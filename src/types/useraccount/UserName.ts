import { IsEmail, IsString, MaxLength } from "class-validator";
import { Unique } from "../../decorators/typeproperty/Unique";
import { Private } from "../../decorators/typeproperty/Private";

export default class UserName{
  @Unique()
  @IsString()
  @MaxLength(320)
  @IsEmail()
  @Private()
  userName!: string;
}
