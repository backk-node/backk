import { PostQueryOperations } from "./PostQueryOperations";
import SortBy from "./SortBy";
import Pagination from "./Pagination";
export default class DefaultPostQueryOperations implements PostQueryOperations {
    includeResponseFields?: string[];
    excludeResponseFields?: string[];
    sortBys: SortBy[];
    paginations: Pagination[];
}
