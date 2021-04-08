import { IsIn, IsOptional, IsString } from "class-validator";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import { Lengths } from "../../constants/constants";

export default class SortBy {
  constructor(subEntityPath: string, fieldName: string, sortDirection: 'ASC' | 'DESC') {
    this.subEntityPath = subEntityPath;
    this.fieldName = fieldName;
    this.sortDirection = sortDirection;
  }

  @IsOptional()
  @MaxLengthAndMatches(Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/)
  @IsString()
  subEntityPath?: string = '';

  @MaxLengthAndMatches(Lengths._512, /^[a-zA-Z_][a-zA-Z0-9_.]*$/)
  @IsString()
  fieldName!: string;

  @IsIn(['ASC', 'DESC'])
  sortDirection!: 'ASC' | 'DESC';
}
