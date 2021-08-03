import CurrentPageToken from '../../types/postqueryoperations/CurrentPageToken';
import Pagination from '../../types/postqueryoperations/Pagination';
import { createHmac } from 'crypto';
import { throwException } from '../../utils/throwException';
import createBackkErrorFromErrorMessageAndStatusCode from '../../errors/createBackkErrorFromErrorMessageAndStatusCode';
import { HttpStatusCodes } from '../../constants/constants';

export default function tryEnsureProperPageIsRequested(
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

    const newPageToken = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? throwException('Environment variable ENCRYPTION_KEY is not defined')
    )
      .update(pagination.pageNumber.toString())
      .digest('base64');

    const prevPageToken = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? throwException('Environment variable ENCRYPTION_KEY is not defined')
    )
      .update((pagination.pageNumber - 1).toString())
      .digest('base64');

    const nextPageToken = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? throwException('Environment variable ENCRYPTION_KEY is not defined')
    )
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
