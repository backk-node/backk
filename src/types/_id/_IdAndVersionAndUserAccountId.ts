import IsStringOrObjectId from '../../decorators/typeproperty/IsStringOrObjectId';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import _IdAndVersion from './_IdAndVersion';
import NotUnique from "../../decorators/typeproperty/NotUnique";
import ReadWrite from "../../decorators/typeproperty/access/ReadWrite";

// eslint-disable-next-line @typescript-eslint/class-value-casing
export default class _IdAndVersionAndUserAccountId extends _IdAndVersion {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  @NotUnique()
  @ReadWrite()
  userAccountId!: string;
}
