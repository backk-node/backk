import DefaultPostQueryOperationsImpl from "./DefaultPostQueryOperationsImpl";
import IsStringOrObjectId from "../../decorators/typeproperty/IsStringOrObjectId";
import MaxLengthAndMatches from "../../decorators/typeproperty/MaxLengthAndMatches";
import { Values } from "../../constants/constants";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndDefaultPostQueryOperations extends DefaultPostQueryOperationsImpl {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(Values._24, /^[a-f\d]{1,24}$/)
  _id!: string;
}
