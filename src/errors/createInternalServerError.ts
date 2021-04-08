import { BackkError, backkErrorSymbol } from "../types/BackkError";
import { HttpStatusCodes } from "../constants/constants";

export default function createInternalServerError(errorMessage: string): BackkError {
  return {
    [backkErrorSymbol]: true,
    message: errorMessage,
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR
  };
}
