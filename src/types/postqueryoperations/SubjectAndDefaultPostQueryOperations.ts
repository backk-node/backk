import DefaultPostQueryOperations from "./DefaultPostQueryOperations";
import { IsString, MaxLength } from "class-validator";
import IsAnyString from "../../decorators/typeproperty/IsAnyString";

export default class SubjectAndDefaultPostQueryOperations extends DefaultPostQueryOperations {
  @IsString()
  @MaxLength(512)
  @IsAnyString()
  subject!: string;
}
