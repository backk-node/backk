import _Id from './_Id';
import { BackkEntity } from '../entities/BackkEntity';
import { IsDate } from 'class-validator';
import IsUndefined from '../../decorators/typeproperty/IsUndefined';
import ReadOnly from "../../decorators/typeproperty/access/ReadOnly";

// eslint-disable-next-line @typescript-eslint/class-value-casing
export default class _IdAndCreatedAtTimestamp extends _Id implements BackkEntity {
  @IsUndefined({ groups: ['__backk_create__', '__backk_update__'] })
  @IsDate({ groups: ['__backk_none__'] })
  @ReadOnly()
  createdAtTimestamp!: Date;
}
