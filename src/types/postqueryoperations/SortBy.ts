import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import assertIsColumnName from '../../assertions/assertIsColumnName';
import { Lengths } from '../../constants/constants';
import IsAnyString from '../../decorators/typeproperty/IsAnyString';
import LengthAndMatches from '../../decorators/typeproperty/LengthAndMatches';
import MaxLengthAndMatches from '../../decorators/typeproperty/MaxLengthAndMatches';

export default class SortBy {
  constructor(subEntityPath: string, fieldNameOrSortExpression: string, sortDirection: 'ASC' | 'DESC') {
    this.subEntityPath = subEntityPath;
    try {
      assertIsColumnName(fieldNameOrSortExpression, '');
      this.fieldName = fieldNameOrSortExpression;
    } catch {
      this.sortExpression = fieldNameOrSortExpression;
    }
    this.sortDirection = sortDirection;
  }

  @IsOptional()
  @MaxLengthAndMatches(Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/)
  @IsString()
  subEntityPath?: string = '';

  @IsOptional()
  // Ensure empty string when validating client input, NEVER allow sortExpression from client due to risk of SQL injection attack
  // sortExpression can be set only on server side, but never include client input to sort expression on server side
  // If you want client side to sort by an expression, you should create a new field in entity to store the sort expression result and allow client to sort by that field
  @MaxLength(0)
  @IsAnyString()
  @IsString()
  sortExpression?: string;

  @LengthAndMatches(1, Lengths._512, /^[a-zA-Z_][a-zA-Z0-9_.]*$/)
  @IsString()
  fieldName!: string;

  @IsIn(['ASC', 'DESC'])
  sortDirection!: 'ASC' | 'DESC';
}
