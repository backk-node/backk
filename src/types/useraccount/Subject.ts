import { IsString, MaxLength } from "class-validator";
import Unique from "../../decorators/typeproperty/Unique";
import Private from "../../decorators/typeproperty/Private";
import IsSubject from "../../decorators/typeproperty/IsSubject";

export default class Subject {
  @Unique()
  @IsString()
  @MaxLength(255)
  @IsSubject()
  @Private()
  subject!: string;
}
