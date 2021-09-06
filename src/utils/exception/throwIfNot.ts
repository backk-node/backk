import { BackkError } from "../../types/BackkError";

export default function throwIfNot(value: any, error: BackkError | null | undefined) {
  if (!value) {
    throw error;
  }
}
