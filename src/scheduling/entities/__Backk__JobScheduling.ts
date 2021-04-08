import Entity from "../../decorators/entity/Entity";
import _Id from "../../types/id/_Id";
import { IsDate, IsString, MaxLength } from "class-validator";
import { Lengths } from "../../constants/constants";

@Entity()
// eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/class-name-casing
export default class __Backk__JobScheduling extends _Id {
  @IsString()
  @MaxLength(Lengths._512)
  serviceFunctionName!: string;

  @IsString()
  @MaxLength(Lengths._8K)
  serviceFunctionArgument!: string;

  @IsDate()
  scheduledExecutionTimestamp!: Date;

  @IsString()
  @MaxLength(Lengths._512)
  retryIntervalsInSecs!: string;
}
