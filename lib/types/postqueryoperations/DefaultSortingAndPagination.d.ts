import { PostQueryOperations } from "./PostQueryOperations";
import SortBy from "./SortBy";
import Pagination from "./Pagination";
export default class DefaultSortingAndPagination implements PostQueryOperations {
    sortBys: SortBy[];
    paginations: Pagination[];
}
