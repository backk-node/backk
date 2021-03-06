import IsStringOrObjectId from "../../decorators/typeproperty/IsStringOrObjectId";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import { Values } from "../../constants/constants";
import NotUnique from "../../decorators/typeproperty/NotUnique";
import ReadWrite from "../../decorators/typeproperty/access/ReadWrite";

export default class UserAccountId {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(Values._24, /^[a-f\d]{1,24}$/)
  @NotUnique()
  @ReadWrite()
  userAccountId!: string;
}
