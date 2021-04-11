import { PostQueryOperations } from "./PostQueryOperations";
import Pagination from "./Pagination";
export default class DefaultPagination implements PostQueryOperations {
    paginations: Pagination[];
}
