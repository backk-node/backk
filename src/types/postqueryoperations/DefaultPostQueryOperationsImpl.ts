import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInstance,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Lengths, Values } from '../../constants/constants';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import CurrentPageToken from './CurrentPageToken';
import Pagination from './Pagination';
import { PostQueryOperations } from './PostQueryOperations';
import SortBy from './SortBy';

export default class DefaultPostQueryOperationsImpl implements PostQueryOperations {
  constructor(rootEntitiesPageNumber: number = 1, rootEntitiesPageSize: number = Values._50) {
    this.paginations = [
      new Pagination('', rootEntitiesPageNumber, rootEntitiesPageSize),
      new Pagination('*', 1, 50),
    ];
  }

  @IsOptional()
  @IsString({ each: true })
  @MaxLengthAndMatches(Lengths._512, /^[a-zA-Z_]([a-zA-Z0-9_.])+$/, { each: true }, true)
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(Values._500)
  @ArrayUnique()
  includeResponseFields?: string[] = [];

  @IsOptional()
  @IsString({ each: true })
  @MaxLengthAndMatches(Lengths._512, /^[a-zA-Z_]([a-zA-Z0-9_.])+$/, { each: true }, true)
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(Values._100)
  @ArrayUnique()
  excludeResponseFields?: string[] = [];

  @IsOptional()
  @IsInstance(SortBy, { each: true })
  @ValidateNested({ each: true })
  @Type(() => SortBy)
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(Values._25)
  sortBys: SortBy[] = [new SortBy('*', '_id', 'ASC'), new SortBy('*', 'id', 'ASC')];

  @IsOptional()
  @IsInstance(Pagination, { each: true })
  @ValidateNested({ each: true })
  @Type(() => Pagination)
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(Values._100)
  paginations: Pagination[];

  @IsOptional()
  @IsInstance(CurrentPageToken, { each: true })
  @ValidateNested({ each: true })
  @Type(() => CurrentPageToken)
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(Values._100)
  currentPageTokens: CurrentPageToken[] = [];
}
