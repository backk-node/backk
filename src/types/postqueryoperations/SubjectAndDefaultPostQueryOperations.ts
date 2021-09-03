import DefaultPostQueryOperations from "./DefaultPostQueryOperations";
import { IsString, MaxLength } from "class-validator";
import IsSubject from "../../decorators/typeproperty/IsSubject";

export default class SubjectAndDefaultPostQueryOperations extends DefaultPostQueryOperations {
  @IsString()
  @MaxLength(255)
  @IsSubject()
  subject!: string;
}
