import _IdAndCreatedAtTimestamp from "./_IdAndCreatedAtTimestamp";
import { BackkEntity } from "../entities/BackkEntity";
export default class _IdAndCreatedAtTimestampAndLastModifiedTimestamp extends _IdAndCreatedAtTimestamp implements BackkEntity {
    readonly lastModifiedTimestamp: Date;
}
