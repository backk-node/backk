import { CallOrSendToSpec } from "../sendToRemoteServiceInsideTransaction";
import { PromiseErrorOr } from "../../../types/PromiseErrorOr";
export declare enum SendAcknowledgementType {
    NONE = 0,
    LEADER_ONLY = 1,
    ALL_REPLICAS = -1
}
export default function sendOneOrMoreToKafka(sends: CallOrSendToSpec[], isTransactional: boolean): PromiseErrorOr<null>;
