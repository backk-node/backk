import _IdAndVersionAndCreatedAtTimestamp from './_IdAndVersionAndCreatedAtTimestamp';
import { BackkEntity } from '../entities/BackkEntity';
export default class _IdAndVersionAndCreatedAtTimestampAndLastModifiedTimestamp extends _IdAndVersionAndCreatedAtTimestamp implements BackkEntity {
    lastModifiedTimestamp: Date;
}
