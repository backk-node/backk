import Entity from "../../decorators/entity/Entity";
import _Id from "../../types/id/_Id";
import { IsDate, IsString, MaxLength } from "class-validator";
import { Lengths } from "../../constants/constants";
import NotUnique from "../../decorators/typeproperty/NotUnique";
import ReadWrite from "../../decorators/typeproperty/access/ReadWrite";

@Entity()
// eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/class-name-casing
export default class __Backk__JobScheduling extends _Id {
  @IsString()
  @NotUnique()
  @MaxLength(Lengths._512)
  @ReadWrite()
  public serviceFunctionName!: string;

  @IsString()
  @NotUnique()
  @MaxLength(Lengths._8K)
  @ReadWrite()
  public serviceFunctionArgument!: string;

  @IsDate()
  @ReadWrite()
  public scheduledExecutionTimestamp!: Date;

  @IsString()
  @NotUnique()
  @MaxLength(Lengths._512)
  @ReadWrite()
  public retryIntervalsInSecs!: string;
}
