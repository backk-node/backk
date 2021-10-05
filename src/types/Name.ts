import { MaxLength } from "class-validator";
import IsAnyString from "../decorators/typeproperty/IsAnyString";
import { Lengths } from "../constants/constants";
import Entity from "../decorators/entity/Entity";

@Entity()
export class Name {
  @MaxLength(Lengths._1K)
  @IsAnyString()
  name!: string;
}
