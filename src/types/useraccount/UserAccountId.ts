// eslint-disable-next-line @typescript-eslint/class-name-casing
import IsStringOrObjectId from "../../decorators/typeproperty/IsStringOrObjectId";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import { Values } from "../../constants/constants";
import NotUnique from "../../decorators/typeproperty/NotUnique";

export default class UserAccountId {
  @NotUnique()
  @IsStringOrObjectId()
  @MaxLengthAndMatches(Values._24, /^[a-f\d]{1,24}$/)
  userAccountId!: string;
}
