import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import { BackkEntity } from '../entities/BackkEntity';
import IsUndefined from '../../decorators/typeproperty/IsUndefined';
import IsStringOrObjectId from '../../decorators/typeproperty/IsStringOrObjectId';
import ReadUpdate from "../../decorators/typeproperty/access/ReadUpdate";

// eslint-disable-next-line @typescript-eslint/class-value-casing
export default class _Id implements BackkEntity {
  @IsUndefined({ groups: ['__backk_create__'] })
  @IsStringOrObjectId({ groups: ['__backk_update__'] })
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/, { groups: ['__backk_update__'] })
  @ReadUpdate()
  _id!: string;
}
