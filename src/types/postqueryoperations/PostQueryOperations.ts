import { Projection } from "./Projection";
import { SortBys } from "./SortBys";
import Pagination from "./Pagination";

export interface PostQueryOperations extends Projection, SortBys {
  paginations?: Pagination[];
}
