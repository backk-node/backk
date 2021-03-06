import { createHmac } from "crypto";
import { HttpStatusCodes } from "../../constants/constants";
import createBackkErrorFromErrorMessageAndStatusCode
  from "../../errors/createBackkErrorFromErrorMessageAndStatusCode";
import CurrentPageToken from "../../types/postqueryoperations/CurrentPageToken";
import Pagination from "../../types/postqueryoperations/Pagination";
import throwException from "../../utils/exception/throwException";

export default function tryEnsurePreviousOrNextPageIsRequested(
  currentPageTokens: CurrentPageToken[] | undefined,
  paginations: Pagination[] | undefined
) {
  paginations?.forEach((pagination) => {
    const currentPageToken = currentPageTokens?.find(
      (currentPageToken) => currentPageToken.subEntityPath === pagination.subEntityPath
    );

    if (!currentPageToken) {
      throw createBackkErrorFromErrorMessageAndStatusCode(
        'currentPageToken is missing for subEntityPath: ' + pagination.subEntityPath,
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const encryptionKey =
      process.env.ENCRYPTION_KEY ?? throwException('Environment variable ENCRYPTION_KEY is not defined');

    const newPageToken = createHmac('sha256', encryptionKey)
      .update(pagination.pageNumber.toString())
      .digest('base64');

    const prevPageToken = createHmac('sha256', encryptionKey)
      .update((pagination.pageNumber - 1).toString())
      .digest('base64');

    const nextPageToken = createHmac('sha256', encryptionKey)
      .update((pagination.pageNumber + 1).toString())
      .digest('base64');

    if (
      newPageToken !== currentPageToken.currentPageToken &&
      currentPageToken.currentPageToken !== prevPageToken &&
      currentPageToken.currentPageToken !== nextPageToken
    ) {
      throw createBackkErrorFromErrorMessageAndStatusCode(
        'Fetching requested page is not allowed. You can only fetch previous or next page for subEntityPath: ' +
          pagination.subEntityPath,
        HttpStatusCodes.BAD_REQUEST
      );
    }
  });
}
