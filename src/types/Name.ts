import { MaxLength } from "class-validator";
import IsAnyString from "../decorators/typeproperty/IsAnyString";
import { Lengths } from "../constants/constants";

export class Name {
  @MaxLength(Lengths._1K)
  @IsAnyString()
  name!: string;
}
