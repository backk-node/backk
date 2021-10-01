import _IdAndCreatedAtTimestamp from './_IdAndCreatedAtTimestamp';
import { BackkEntity } from '../entities/BackkEntity';
import IsUndefined from '../../decorators/typeproperty/IsUndefined';
import { IsDate } from 'class-validator';
import ReadOnly from "../../decorators/typeproperty/access/ReadOnly";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCreatedAtTimestampAndLastModifiedTimestamp extends _IdAndCreatedAtTimestamp
  implements BackkEntity {
  @IsUndefined({ groups: ['__backk_create__', '__backk_update__'] })
  @IsDate({ groups: ['__backk_none__'] })
  @ReadOnly()
  lastModifiedTimestamp!: Date;
}
