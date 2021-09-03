import { IsString, MaxLength } from "class-validator";
import Unique from "../../decorators/typeproperty/Unique";
import Private from "../../decorators/typeproperty/Private";
import IsAnyString from "../../decorators/typeproperty/IsAnyString";

export default class Subject {
  @Unique()
  @IsString()
  @MaxLength(320)
  @IsAnyString()
  @Private()
  subject!: string;
}
