import _Id from "./_Id";
import { BackkEntity } from "../entities/BackkEntity";
export default class _IdAndCreatedAtTimestamp extends _Id implements BackkEntity {
    readonly createdAtTimestamp: Date;
}
