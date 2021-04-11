import _Id from "./_Id";
import { BackkEntity } from "../entities/BackkEntity";
export default class _IdAndUserAccountId extends _Id implements BackkEntity {
    userAccountId: string;
}
