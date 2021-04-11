import _IdAndVersion from './_IdAndVersion';
import { BackkEntity } from '../entities/BackkEntity';
export default class _IdAndVersionAndCreatedAtTimestamp extends _IdAndVersion implements BackkEntity {
    createdAtTimestamp: Date;
}
