import { PostQueryOperations } from "./PostQueryOperations";
import SortBy from "./SortBy";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInstance, IsOptional, ValidateNested } from "class-validator";
import { Values } from "../../constants/constants";

export default class DefaultSorting implements PostQueryOperations {
  @IsOptional()
  @IsInstance(SortBy, { each: true })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(Values._25)
  sortBys: SortBy[] = [new SortBy('*', '_id', 'ASC'), new SortBy('*', 'id', 'ASC')];
}
