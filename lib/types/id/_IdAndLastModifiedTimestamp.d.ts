import _Id from "./_Id";
import { BackkEntity } from "../entities/BackkEntity";
export default class _IdAndLastModifiedTimestamp extends _Id implements BackkEntity {
    readonly lastModifiedTimestamp: Date;
}
