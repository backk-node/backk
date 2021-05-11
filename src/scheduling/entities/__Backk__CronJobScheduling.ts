/* eslint-disable @typescript-eslint/class-name-casing,@typescript-eslint/camelcase */
import Entity from "../../decorators/entity/Entity";
import _Id from "../../types/id/_Id";
import { IsDate, IsString, MaxLength } from "class-validator";
import Unique from "../../decorators/typeproperty/Unique";
import { Lengths } from "../../constants/constants";
import ReadWrite from "../../decorators/typeproperty/ReadWrite";

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
