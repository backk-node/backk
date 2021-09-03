import { IsString, MaxLength } from "class-validator";
import Unique from "../../decorators/typeproperty/Unique";
import Private from "../../decorators/typeproperty/Private";
import IsSubject from "../../decorators/typeproperty/IsSubject";
import ReadWrite from "../../decorators/typeproperty/ReadWrite";

export default class Subject {
  @Unique()
  @IsString()
  @IsSubject()
  @ReadWrite()
  @MaxLength(255)
  @Private()
  subject!: string;
}
