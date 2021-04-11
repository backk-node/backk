import { BackkEntity } from "../entities/BackkEntity";
import _IdAndCreatedAtTimestamp from "./_IdAndCreatedAtTimestamp";
export default class _IdAndCreatedAtTimestampAndUserAccountId extends _IdAndCreatedAtTimestamp implements BackkEntity {
    userAccountId: string;
}
