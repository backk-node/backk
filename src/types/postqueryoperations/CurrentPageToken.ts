import { IsAlphanumeric, IsOptional, IsString, MaxLength } from "class-validator";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import { Lengths } from "../../constants/constants";

export default class CurrentPageToken {
  constructor(subEntityPath: string, currentPageToken: string) {
    this.subEntityPath = subEntityPath;
    this.currentPageToken = currentPageToken;
  }

  @IsOptional()
  @MaxLengthAndMatches(Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/)
  @IsString()
  subEntityPath?: string = '';

  @IsString()
  @IsAlphanumeric()
  @MaxLength(64)
  currentPageToken!: string;
}
