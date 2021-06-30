import { IsOptional, IsString } from "class-validator";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import { Lengths } from "../../constants/constants";

export default class EntityCountRequest {
  constructor(subEntityPath: string, shouldReturnEntityCount: boolean = true) {
    this.subEntityPath = subEntityPath;
    this.shouldReturnEntityCount = shouldReturnEntityCount;
  }

  @IsOptional()
  @MaxLengthAndMatches(Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/)
  @IsString()
  subEntityPath?: string = '';

  shouldReturnEntityCount!: boolean
}
