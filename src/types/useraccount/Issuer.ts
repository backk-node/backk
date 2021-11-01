import { IsString, IsUrl, MaxLength } from "class-validator";
import Unique from "../../decorators/typeproperty/Unique";
import CreateOnly from "../../decorators/typeproperty/access/CreateOnly";

export default class Issuer {
  @Unique()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  @CreateOnly()
  issuer!: string;
}
