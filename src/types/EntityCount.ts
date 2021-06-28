import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import MaxLengthAndMatches from "../decorators/typeproperty/MaxLengthAndMatches";
import { Lengths } from "../constants/constants";

export default class EntityCount {
  constructor(subEntityPath: string, entityCount: number) {
    this.subEntityPath = subEntityPath;
    this.entityCount = entityCount;
  }

  @IsOptional()
  @MaxLengthAndMatches(Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/)
  @IsString()
  subEntityPath?: string = '';

  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  entityCount!: number;
}
