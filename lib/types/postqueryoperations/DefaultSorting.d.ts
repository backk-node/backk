import { PostQueryOperations } from "./PostQueryOperations";
import SortBy from "./SortBy";
export default class DefaultSorting implements PostQueryOperations {
    sortBys: SortBy[];
}
