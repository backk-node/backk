import { CallOrSendToSpec } from "../sendToRemoteServiceInsideTransaction";
import { PromiseErrorOr } from "../../../types/PromiseErrorOr";
export default function sendOneOrMoreToRedis(sends: CallOrSendToSpec[], isTransactional: boolean): PromiseErrorOr<null>;
