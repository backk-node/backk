import { backkErrorSymbol } from "../types/BackkError";

export default function isBackkError(error: any): boolean {
  return error[backkErrorSymbol];
}
