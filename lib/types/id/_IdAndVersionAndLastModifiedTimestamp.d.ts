import _IdAndVersion from './_IdAndVersion';
import { BackkEntity } from '../entities/BackkEntity';
export default class _IdAndVersionAndLastModifiedTimestamp extends _IdAndVersion implements BackkEntity {
    lastModifiedTimestamp: Date;
}
