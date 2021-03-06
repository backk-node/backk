import Entity from "../decorators/entity/Entity";
import MaxLengthAndMatches from "../decorators/typeproperty/MaxLengthAndMatches";
import _IdAndVersion from "./_id/_IdAndVersion";
import Unique from "../decorators/typeproperty/Unique";
import { IsString } from "class-validator";
import { Lengths } from "../constants/constants";
import ReadWrite from "../decorators/typeproperty/access/ReadWrite";

@Entity()
export default class DbTableVersion extends _IdAndVersion {
  @Unique()
  @IsString()
  @MaxLengthAndMatches(Lengths._512, /^[a-zA-Z_][a-zA-Z0-9_]*$/)
  @ReadWrite()
  entityName!: string;
}
