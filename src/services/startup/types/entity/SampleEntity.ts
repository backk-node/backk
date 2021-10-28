import Entity from "../../../../decorators/entity/Entity";
import _Id from "../../../../types/_id/_Id";
import ReadWrite from "../../../../decorators/typeproperty/access/ReadWrite";
import IsAnyString from "../../../../decorators/typeproperty/IsAnyString";
import Private from "../../../../decorators/typeproperty/access/Private";

@Entity()
export default class SampleEntity extends _Id {
  @ReadWrite()
  @IsAnyString()
  name!: string;

  @ReadWrite()
  @IsAnyString()
  name2!: string;

  @Private()
  @IsAnyString()
  name3!: string;
}
