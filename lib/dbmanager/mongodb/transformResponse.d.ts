import { PostQueryOperations } from "../../types/postqueryoperations/PostQueryOperations";
export default function transformResponse<T extends object>(responseObjects: T[], args: PostQueryOperations): Array<Partial<T>>;
