import _IdAndVersionAndLastModifiedTimestamp from './_IdAndVersionAndLastModifiedTimestamp';
import IsStringOrObjectId from '../../decorators/typeproperty/IsStringOrObjectId';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import NotUnique from "../../decorators/typeproperty/NotUnique";
import ReadWrite from "../../decorators/typeproperty/access/ReadWrite";

// eslint-disable-next-line @typescript-eslint/class-value-casing
export default class _IdAndVersionAndLastModifiedTimestampAndUserAccountId extends _IdAndVersionAndLastModifiedTimestamp {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  @NotUnique()
  @ReadWrite()
  userAccountId!: string;
}
