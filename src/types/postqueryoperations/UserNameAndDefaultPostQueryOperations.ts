import DefaultPostQueryOperations from "./DefaultPostQueryOperations";
import { IsEmail, IsString, MaxLength } from "class-validator";

export default class UserNameAndDefaultPostQueryOperations extends DefaultPostQueryOperations {
  @IsString()
  @MaxLength(320)
  @IsEmail()
  userName!: string;
}
