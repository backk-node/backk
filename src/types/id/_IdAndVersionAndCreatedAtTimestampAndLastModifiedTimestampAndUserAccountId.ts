import _IdAndVersionAndCreatedAtTimestampAndLastModifiedTimestamp from './_IdAndVersionAndCreatedAtTimestampAndLastModifiedTimestamp';
import IsStringOrObjectId from "../../decorators/typeproperty/IsStringOrObjectId";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndVersionAndCreatedAtTimestampAndLastModifiedTimestampAndUserAccountId extends _IdAndVersionAndCreatedAtTimestampAndLastModifiedTimestamp {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  public userAccountId!: string;
}
