import _IdAndLastModifiedTimestamp from './_IdAndLastModifiedTimestamp';
import IsStringOrObjectId from '../../decorators/typeproperty/IsStringOrObjectId';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import NotUnique from "../../decorators/typeproperty/NotUnique";

export default class _IdAndLastModifiedTimestampAndUserAccountId extends _IdAndLastModifiedTimestamp {
  @NotUnique()
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  public userAccountId!: string;
}
