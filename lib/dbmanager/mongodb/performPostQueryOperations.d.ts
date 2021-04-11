import { AggregationCursor, Cursor } from 'mongodb';
import { PostQueryOperations } from '../../types/postqueryoperations/PostQueryOperations';
export default function performPostQueryOperations<T>(cursor: Cursor<T> | AggregationCursor<T>, postQueryOperations: PostQueryOperations | undefined, EntityClass: new () => T, Types: any): void;
