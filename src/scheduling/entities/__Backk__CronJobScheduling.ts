/* eslint-disable @typescript-eslint/class-value-casing,@typescript-eslint/camelcase */
import Entity from "../../decorators/entity/Entity";
import _Id from "../../types/id/_Id";
import { IsDate, IsString, MaxLength } from "class-validator";
import Unique from "../../decorators/typeproperty/Unique";
import { Lengths } from "../../constants/constants";
import ReadWrite from "../../decorators/typeproperty/access/ReadWrite";

@Entity()
export default class __Backk__CronJobScheduling extends _Id {
  @Unique()
  @IsString()
  @MaxLength(Lengths._512)
  @ReadWrite()
  public serviceFunctionName!: string;

  @IsDate()
  @ReadWrite()
  lastScheduledTimestamp!: Date;

  @IsDate()
  @ReadWrite()
  nextScheduledTimestamp!: Date;
}
