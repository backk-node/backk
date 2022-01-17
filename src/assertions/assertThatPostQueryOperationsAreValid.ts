import { PostQueryOperations } from "../types/postqueryoperations/PostQueryOperations";
import getValidationConstraint from "../validation/getValidationConstraint";

export default function assertThatPostQueryOperationsAreValid(postQueryOperations?: PostQueryOperations) {
  postQueryOperations?.sortBys?.forEach(sortBy => {
    if (sortBy.constructor !== Object) {
      const maxLengthValidationConstraint = getValidationConstraint(sortBy.constructor, 'sortExpression', 'maxLength');
      if (maxLengthValidationConstraint !== 0) {
        throw new Error("In postQueryOperations 'sortBy' objects' property 'sortExpression' must have 'MaxLength(0)' validation")
      }
    }
  })
}
