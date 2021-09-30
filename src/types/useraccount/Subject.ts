import { IsString, MaxLength } from "class-validator";
import Unique from "../../decorators/typeproperty/Unique";
import IsSubject from "../../decorators/typeproperty/IsSubject";
import CreateOnly from "../../decorators/typeproperty/access/CreateOnly";

export default class Subject {
  @Unique()
  @IsString()
  @IsSubject()
  @MaxLength(255)
  @CreateOnly()
  subject!: string;
}
