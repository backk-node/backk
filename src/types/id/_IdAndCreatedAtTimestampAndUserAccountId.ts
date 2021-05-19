import { BackkEntity } from '../entities/BackkEntity';
import IsStringOrObjectId from '../../decorators/typeproperty/IsStringOrObjectId';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import _IdAndCreatedAtTimestamp from './_IdAndCreatedAtTimestamp';
import NotUnique from "../../decorators/typeproperty/NotUnique";
import ReadWrite from "../../decorators/typeproperty/ReadWrite";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCreatedAtTimestampAndUserAccountId extends _IdAndCreatedAtTimestamp
  implements BackkEntity {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  @NotUnique()
  @ReadWrite()
  public userAccountId!: string;
}
