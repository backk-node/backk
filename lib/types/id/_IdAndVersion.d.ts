import _Id from './_Id';
import { BackkEntity } from '../entities/BackkEntity';
export default class _IdAndVersion extends _Id implements BackkEntity {
    version: number;
}
