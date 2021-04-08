// eslint-disable-next-line @typescript-eslint/class-name-casing
import { Unique } from "../../decorators/typeproperty/Unique";
import IsStringOrObjectId from "../../decorators/typeproperty/IsStringOrObjectId";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import { Values } from "../../constants/constants";

export default class UserAccountId {
  @Unique()
  @IsStringOrObjectId()
  @MaxLengthAndMatches(Values._24, /^[a-f\d]{1,24}$/)
  userAccountId!: string;
}
