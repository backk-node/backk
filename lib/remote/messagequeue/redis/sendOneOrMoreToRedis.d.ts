import { CallOrSendTo } from "../sendToRemoteServiceInsideTransaction";
import { PromiseErrorOr } from "../../../types/PromiseErrorOr";
export default function sendOneOrMoreToRedis(sends: CallOrSendTo[], isTransactional: boolean): PromiseErrorOr<null>;
