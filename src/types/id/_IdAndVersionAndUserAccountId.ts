import IsStringOrObjectId from '../../decorators/typeproperty/IsStringOrObjectId';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import _IdAndVersion from './_IdAndVersion';
import NotUnique from "../../decorators/typeproperty/NotUnique";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndVersionAndUserAccountId extends _IdAndVersion {
  @NotUnique()
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  public userAccountId!: string;
}
