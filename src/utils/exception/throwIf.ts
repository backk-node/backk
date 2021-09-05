import { BackkError } from "../../types/BackkError";

export default function throwIf(error: BackkError | null | undefined) {
  if (error) {
    throw error;
  }
}
