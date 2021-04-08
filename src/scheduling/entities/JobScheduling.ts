import { ArrayMaxSize, IsArray, IsDate, IsInt, IsString, MaxLength } from 'class-validator';
import { Type } from "class-transformer";
import { Lengths } from "../../constants/constants";

export default class JobScheduling {
  @IsString()
  @MaxLength(Lengths._256)
  serviceFunctionName!: string;

  @IsDate()
  @Type(() => Date)
  scheduledExecutionTimestamp!: Date;

  @IsInt({ each: true })
  @IsArray()
  @ArrayMaxSize(25)
  retryIntervalsInSecs!: number[];
}
