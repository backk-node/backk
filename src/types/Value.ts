import { MaxLength } from "class-validator";
import IsAnyString from "../decorators/typeproperty/IsAnyString";
import { Lengths } from "../constants/constants";
import Entity from "../decorators/entity/Entity";
import ReadWrite from "../decorators/typeproperty/access/ReadWrite";

@Entity()
export default class Value {
  @MaxLength(Lengths._1K)
  @IsAnyString()
  @ReadWrite()
  value!: string;
}
