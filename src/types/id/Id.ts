import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import IsStringOrObjectId from "../../decorators/typeproperty/IsStringOrObjectId";
import ReadWrite from "../../decorators/typeproperty/access/ReadWrite";
import NotUnique from "../../decorators/typeproperty/NotUnique";

export default class Id {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  @NotUnique()
  @ReadWrite()
  id!: string;
}
