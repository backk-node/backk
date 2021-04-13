import { ArrayMaxSize, ArrayMinSize, IsArray } from "class-validator";
import DefaultPostQueryOperations from "./DefaultPostQueryOperations";
import IsStringOrObjectId from "../../decorators/typeproperty/IsStringOrObjectId";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdsAndDefaultPostQueryOperations extends DefaultPostQueryOperations {
  @IsStringOrObjectId({ each: true })
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  _ids!: string[];
}
