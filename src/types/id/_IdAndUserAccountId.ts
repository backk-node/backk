import _Id from './_Id';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';
import { BackkEntity } from '../entities/BackkEntity';
import IsStringOrObjectId from '../../decorators/typeproperty/IsStringOrObjectId';

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndUserAccountId extends _Id implements BackkEntity {
  @IsStringOrObjectId()
  @MaxLengthAndMatches(24, /^[a-f\d]{1,24}$/)
  public userAccountId!: string;
}
